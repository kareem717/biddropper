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
import { accountProcedure } from "../trpc";
import { z } from "zod";

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
						ownerAccountId: accountJobs.accountId,
						ownerCompanyId: companyJobs.companyId,
					})
					.from(jobs)
					.leftJoin(companyJobs, eq(jobs.id, companyJobs.jobId))
					.where(eq(jobs.id, jobId));

				// Verify that the bid is NOT for a job owned by the current account or one of their companies
				if (
					job.ownerAccountId === ctx.account.id ||
					job.ownerCompanyId === ctx.account.id
				) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "cannot bid on your own job",
					});
				}

				// Verify that the bid is for a company owned by the current account
				if (
					!ctx.ownedCompanies.map((c) => c.id).includes(bid.senderCompanyId)
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

				return newbid.id;
			});

			return newId;
		}),
	acceptBid: companyOwnerProcedure
		.input(z.object({ bidId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { bidId } = input;

			// Fetch bid for verification
			const [bid] = await ctx.db
				.select({
					bids,
					job: {
						ownerAccountId: accountJobs.accountId,
						ownerCompanyId: companyJobs.companyId,
					},
				})
				.from(bids)
				.innerJoin(jobBids, eq(bids.id, jobBids.bidId))
				.leftJoin(accountJobs, eq(jobBids.jobId, accountJobs.jobId))
				.leftJoin(companyJobs, eq(jobBids.jobId, companyJobs.jobId))
				.leftJoin(companies, eq(bids.senderCompanyId, companies.id))
				.where(and(eq(bids.id, bidId), isNull(bids.deletedAt)));

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
				bid.job.ownerAccountId !== ctx.account.id &&
				!ctx.ownedCompanies
					.map((c) => c.id)
					.includes(bid.job.ownerCompanyId || "")
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you are not the owner of the job",
				});
			}

			const res = await ctx.db
				.update(bids)
				.set({ status: "accepted" })
				.where(eq(bids.id, bidId));
			return res;
		}),
	withdrawBid: companyOwnerProcedure
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
				.set({ status: "withdrawn" })
				.where(eq(bids.id, bidId));
			return res;
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
			if (ctx.ownedCompanies.map((c) => c.id).includes(bidRes.company.id || "")) {
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
