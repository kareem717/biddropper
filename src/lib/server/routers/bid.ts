import {
	accountJobs,
	bids,
	companyJobs,
	jobBids,
	jobs,
	companies,
	bidStatus,
	notifications,
} from "@/lib/db/drizzle/schema";
import { router, companyOwnerProcedure } from "../trpc";
import { EditBidSchema, NewBidSchema } from "@/lib/validations/bid";
import { TRPCError } from "@trpc/server";
import {
	eq,
	and,
	isNull,
	or,
	not,
	inArray,
	gt,
	lt,
	asc,
	desc,
} from "drizzle-orm";
import {
	createNotification,
	withCursorPagination,
	generateCursorResponse,
} from "@/lib/server/routers/shared";
import { QueryBuilder, alias } from "drizzle-orm/pg-core";
import { accountProcedure } from "../trpc";
import { z } from "zod";
import { Context } from "@/lib/trpc/context";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

const getBidDetails = async (db: PostgresJsDatabase<any>, bidIds: string[]) => {
	// Define the alias for companies
	const senderCompany = alias(companies, "senderCompany");
	const ownerCompany = alias(companies, "ownerCompany");
	return await db
		.select({
			bids,
			senderCompany: {
				id: senderCompany.id,
				ownerAccountId: senderCompany.ownerId,
			},
			job: {
				id: jobBids.jobId,
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
		.where(and(inArray(bids.id, bidIds), isNull(bids.deletedAt)));
};

const rejectBids = async (
	ctx: Context,
	db: PostgresJsDatabase<any>,
	bidIds: string[]
) => {
	const bidRes = await db
		.select({
			bids,
			job: {
				id: jobBids.jobId,
				ownerAccountId: accountJobs.accountId,
				ownerCompanyId: companyJobs.companyId,
			},
		})
		.from(bids)
		.innerJoin(jobBids, eq(bids.id, jobBids.bidId))
		.leftJoin(companyJobs, eq(jobBids.jobId, companyJobs.jobId))
		.leftJoin(accountJobs, eq(jobBids.jobId, accountJobs.jobId))
		.where(and(inArray(bids.id, bidIds), isNull(bids.deletedAt)));

	if (!bidRes.length) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "bids not found",
		});
	}

	if (!ctx.account) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "unauthorized",
		});
	}

	// Check if the user or their companies own the job the bid was sent on
	if (
		!bidRes.some((b) => {
			const jobOwnerAccountId = b.job.ownerAccountId;
			const jobOwnerCompanyId = b.job.ownerCompanyId;

			if (jobOwnerAccountId && jobOwnerAccountId === ctx.account?.id) {
				return true;
			}

			if (
				jobOwnerCompanyId &&
				ctx.ownedCompanies?.map((c) => c.id).includes(jobOwnerCompanyId || "")
			) {
				return true;
			}

			return false;
		})
	) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "you are not the owner of the job the bid was sent on",
		});
	}

	return await db
		.update(bids)
		.set({ status: "rejected" })
		.where(
			and(inArray(bids.id, bidIds), eq(bids.status, bidStatus.enumValues[0]))
		);
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
	getAccountReceivedBids: accountProcedure
		.input(
			z.object({
				statuses: z.array(z.enum(bidStatus.enumValues)).optional(),
				cursor: z.string().uuid().optional(),
				limit: z.number().optional().default(5),
			})
		)
		.query(async ({ ctx, input }) => {
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

			const baseQuery = ctx.db
				.select({
					bids,
					jobId: jobBids.jobId,
				})
				.from(bids)
				.innerJoin(jobBids, eq(bids.id, jobBids.bidId))
				.$dynamic();

			const whereClause = [
				isNull(bids.deletedAt),
				inArray(
					jobBids.jobId,
					ownedJobIds.map((j) => j.jobId)
				),
			];

			// use default bid statuses (anything except withdrawn) if not specified
			if (input.statuses) {
				whereClause.push(inArray(bids.status, input.statuses));
			} else {
				whereClause.push(not(eq(bids.status, "withdrawn")));
			}

			if (input.cursor) {
				whereClause.push(gt(bids.id, input.cursor));
			}

			const response = await withCursorPagination(baseQuery, bids.id, {
				where: whereClause,
				cursor: input.cursor,
				limit: input.limit,
			});

			return generateCursorResponse("bids.id", response, input.limit);
		}),
	getJobBids: accountProcedure
		.input(
			z.object({
				jobId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { jobId } = input;
			return await ctx.db
				.select({
					bids,
					jobId: jobBids.jobId,
				})
				.from(bids)
				.innerJoin(
					jobBids,
					and(eq(bids.id, jobBids.bidId), eq(jobBids.jobId, jobId))
				);
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

			const [bid] = await getBidDetails(ctx.db, [bidId]);

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
				const otherBidsOnSameJob = await tx
					.select({
						id: bids.id,
						senderCompany: {
							ownerAccountId: companies.ownerId,
						},
					})
					.from(bids)
					.innerJoin(jobBids, eq(bids.id, jobBids.bidId))
					.innerJoin(companies, eq(bids.senderCompanyId, companies.id))
					.where(and(eq(jobBids.jobId, bid.job.id), not(eq(bids.id, bidId))));

				// reject all other pending bids on the same job
				rejectBids(
					ctx,
					tx,
					otherBidsOnSameJob.map((b) => b.id)
				);

				//notify the rejected bidders
				await tx.insert(notifications).values(
					otherBidsOnSameJob.map((b) => ({
						accountId: b.senderCompany.ownerAccountId,
						title: "Bid rejected",
						description: `Your bid for ${bid.job.title} has been rejected`,
					}))
				);

				await tx
					.update(bids)
					.set({ status: "accepted" })
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

			const [bid] = await getBidDetails(ctx.db, [bidId]);

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

			await rejectBids(ctx, ctx.db, [bidId]);
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
