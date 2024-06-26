import {
	accountJobs,
	bids,
	companyJobs,
	jobBids,
	jobs,
	companies,
	bidStatus,
} from "@/lib/db/drizzle/schema";
import { router, companyOwnerProcedure } from "../trpc";
import { EditBidSchema, NewBidSchema } from "@/lib/validations/bid";
import { TRPCError } from "@trpc/server";
import { eq, and, isNull, or, not, inArray } from "drizzle-orm";
import { createNotification } from "@/lib/server/routers/shared";
import { alias } from "drizzle-orm/pg-core";
import { accountProcedure } from "../trpc";
import { z } from "zod";
import { Context } from "@/lib/trpc/context";

const getBidDetails = async (ctx: Context, bidId: string) => {
	// Define the alias for companies
	const senderCompany = alias(companies, "senderCompany");
	const ownerCompany = alias(companies, "ownerCompany");
	const [bid] = await ctx.db
		.select({
			bids,
			senderCompany: {
				id: senderCompany.id,
				ownerAccountId: senderCompany.ownerId,
			},
			job: {
				title: jobs.title,
				jobOwnerAccountId: accountJobs.accountId,
				jobOwnerCompanyId: ownerCompany.id,
				jobOwnerCompanyOwnerAccountId: ownerCompany.ownerId,
			},
		})
		.from(bids)
		.innerJoin(jobBids, eq(bids.id, jobBids.bidId))
		.leftJoin(accountJobs, eq(jobBids.jobId, accountJobs.jobId))
		.leftJoin(companyJobs, eq(jobBids.jobId, companyJobs.jobId))
		.leftJoin(ownerCompany, eq(companyJobs.companyId, ownerCompany.id))
		.innerJoin(senderCompany, eq(bids.senderCompanyId, senderCompany.id))
		.where(and(eq(bids.id, bidId), isNull(bids.deletedAt)));

	return bid;
};

export const bidRouter = router({
	getAccountSentBids: companyOwnerProcedure.query(async ({ ctx }) => {
		const res = await ctx.db
			.select()
			.from(bids)
			.where(
				and(eq(bids.senderCompanyId, ctx.account.id), isNull(bids.deletedAt))
			)
			.innerJoin(jobBids, eq(bids.id, jobBids.bidId));
		return res;
	}),
	getAccountReceivedBids: accountProcedure.query(async ({ ctx }) => {
		const ownedJobIds = await ctx.db
			.select({
				jobId: jobs.id,
			})
			.from(jobs)
			.leftJoin(accountJobs, eq(jobs.id, accountJobs.jobId))
			.leftJoin(companyJobs, eq(jobs.id, companyJobs.jobId))
			.where(
				and(
					or(
						eq(accountJobs.accountId, ctx.account.id),
						eq(companyJobs.companyId, ctx.account.id)
					),
					isNull(jobs.deletedAt)
				)
			);

		if (!ownedJobIds.length) {
			return [];
		}

		const res = await ctx.db
			.select()
			.from(bids)
			.where(
				and(
					isNull(bids.deletedAt),
					not(eq(bids.status, "withdrawn")),
					inArray(
						jobBids.jobId,
						ownedJobIds.map((j) => j.jobId)
					)
				)
			)
			.innerJoin(jobBids, eq(bids.id, jobBids.bidId));
		return res;
	}),
	getJobBids: accountProcedure
		.input(
			z.object({
				jobId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { jobId } = input;
			const res = await ctx.db
				.select({
					bids,
					jobId: jobBids.jobId,
				})
				.from(bids)
				.innerJoin(jobBids, eq(bids.id, jobBids.bidId))
				.where(and(eq(jobBids.jobId, jobId), isNull(bids.deletedAt)));

			return res;
		}),
	getBidFull: accountProcedure
		.input(z.object({ bidId: z.string() }))
		.query(async ({ ctx, input }) => {
			const { bidId } = input;
			const [res] = await ctx.db
				.select({
					bids,
					job: {
						title: jobs.title,
						id: jobs.id,
						ownerAccountId: accountJobs.accountId,
						ownerCompanyId: companyJobs.companyId,
					},
					senderCompanyName: companies.name,
				})
				.from(bids)
				.where(and(eq(bids.id, bidId), isNull(bids.deletedAt)))
				.leftJoin(jobBids, eq(bids.id, jobBids.bidId))
				.innerJoin(jobs, eq(jobBids.jobId, jobs.id))
				.leftJoin(accountJobs, eq(jobs.id, accountJobs.jobId))
				.leftJoin(companyJobs, eq(jobs.id, companyJobs.jobId))
				.innerJoin(companies, eq(bids.senderCompanyId, companies.id));

			return res;
		}),
	createBid: companyOwnerProcedure
		.input(NewBidSchema)
		.mutation(async ({ ctx, input }) => {
			const { jobId, ...bid } = input;
			const newId = await ctx.db.transaction(async (tx) => {
				// Fetch job for verification
				const [job] = await tx
					.select({
						title: jobs.title,
						ownerAccountId: accountJobs.accountId,
						ownerCompany: {
							id: companies.id,
							ownerAccountId: companies.ownerId,
						},
					})
					.from(jobs)
					.leftJoin(companyJobs, eq(jobs.id, companyJobs.jobId))
					.leftJoin(companies, eq(companyJobs.companyId, companies.id))
					.where(eq(jobs.id, jobId));

				// Verify that the bid is NOT for a job owned by the current account or one of their companies
				if (
					job.ownerAccountId === ctx.account.id ||
					job.ownerCompany?.ownerAccountId === ctx.account.id
				) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "cannot bid on your own job",
					});
				}

				// Verify that the bid is for a company owned by the current account
				if (
					job.ownerCompany?.id &&
					!ctx.ownedCompanies.map((c) => c.id).includes(job.ownerCompany.id)
				) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "you are not the owner of the bidding company",
					});
				}

				const [newbid] = await tx
					.insert(bids)
					.values({
						...bid,
						priceUsd: bid.priceUsd.toString(),
					})
					.returning({ id: bids.id });

				await tx.insert(jobBids).values({
					jobId,
					bidId: newbid.id,
				});

				let accountId = job.ownerCompany?.ownerAccountId || job.ownerAccountId;

				if (!accountId) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "account id not found",
					});
				}

				createNotification(
					{
						accountId,
						title: "New bid",
						description: `You have received a new bid for ${job.title}`,
					},
					ctx
				);

				return newbid.id;
			});

			return newId;
		}),
	acceptBid: companyOwnerProcedure
		.input(z.object({ bidId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { bidId } = input;

			const bid = await getBidDetails(ctx, bidId);

			if (!bid) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "bid not found",
				});
			}

			if (bid.bids.status !== bidStatus.enumValues[0]) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "bid is not pending",
				});
			}

			// Verify that the bid is for a job owned by the current account or one of their companies
			if (
				bid.job.jobOwnerAccountId !== ctx.account.id &&
				!ctx.ownedCompanies
					.map((c) => c.id)
					.includes(bid.job.jobOwnerCompanyId || "")
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you are not the owner of the job",
				});
			}

			await ctx.db.transaction(async (tx) => {
				await ctx.db
					.update(bids)
					.set({ status: "withdrawn" })
					.where(eq(bids.id, bidId));

				const accountId = bid.senderCompany.ownerAccountId;

				if (!accountId) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "account id not found",
					});
				}

				createNotification(
					{
						accountId,
						title: "Bid accepted",
						description: `You have been accepted for ${bid.job.title}!`,
					},
					ctx
				);
			});
		}),
	withdrawBid: companyOwnerProcedure
		.input(z.object({ bidId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { bidId } = input;

			const bid = await getBidDetails(ctx, bidId);

			if (!bid) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "bid not found",
				});
			}

			// Verify that the bid is from a company owned by the current account
			if (
				ctx.ownedCompanies.map((c) => c.id).includes(bid.senderCompany.id || "")
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you are not the owner of the company who sent the bid",
				});
			}

			if (bid.bids.status !== bidStatus.enumValues[0]) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "bid is not pending",
				});
			}

			await ctx.db.transaction(async (tx) => {
				await ctx.db
					.update(bids)
					.set({ status: "withdrawn" })
					.where(eq(bids.id, bidId));

				const accountId =
					bid.job.jobOwnerAccountId || bid.job.jobOwnerCompanyOwnerAccountId;

				if (!accountId) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "account id not found",
					});
				}

				createNotification(
					{
						accountId,
						title: "Bid withdrawn",
						description: `A bid for the job ${bid.job.title} has been withdrawn`,
					},
					ctx
				);
			});
		}),
	rejectBid: companyOwnerProcedure
		.input(z.object({ bidId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { bidId } = input;

			// Fetch bid for verification
			const [bid] = await ctx.db
				.select({
					bids,
					company: {
						id: companies.id,
						ownerAccountId: companies.ownerId,
					},
				})
				.from(bids)
				.innerJoin(companies, eq(bids.senderCompanyId, companies.id))
				.where(and(eq(bids.id, bidId), isNull(bids.deletedAt)));

			if (!bid) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "bid not found",
				});
			}

			// Verify that the bid is from a company owned by the current account
			if (ctx.ownedCompanies.map((c) => c.id).includes(bid.company.id || "")) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you are not the owner of the company who sent the bid",
				});
			}

			if (bid.bids.status !== bidStatus.enumValues[0]) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "bid is not pending",
				});
			}

			const res = await ctx.db
				.update(bids)
				.set({ status: "rejected" })
				.where(eq(bids.id, bidId));
			return res;
		}),
	editBid: companyOwnerProcedure
		.input(EditBidSchema)
		.mutation(async ({ ctx, input }) => {
			const { id: bidId, ...bid } = input;

			// Fetch bid for verification
			const [bidRes] = await ctx.db
				.select({
					bids,
					company: {
						id: companies.id,
						ownerAccountId: companies.ownerId,
					},
				})
				.from(bids)
				.innerJoin(companies, eq(bids.senderCompanyId, companies.id))
				.where(and(eq(bids.id, bidId!), isNull(bids.deletedAt)));

			if (!bid) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "bid not found",
				});
			}

			// Verify that the bid is from a company owned by the current account
			if (
				ctx.ownedCompanies.map((c) => c.id).includes(bidRes.company.id || "")
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you are not the owner of the company who sent the bid",
				});
			}

			if (bidRes.bids.status !== bidStatus.enumValues[0]) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "bid is not pending",
				});
			}

			const res = await ctx.db
				.update(bids)
				.set({
					...bid,
					priceUsd: bid.priceUsd.toString(),
				})
				.where(eq(bids.id, bidId!));

			return res;
		}),
});
