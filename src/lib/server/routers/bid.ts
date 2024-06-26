import {
	accountJobs,
	bids,
	companyJobs,
	jobBids,
	jobs,
	companies,
} from "@/lib/db/drizzle/schema";
import { router, companyOwnerProcedure } from "../trpc";
import { NewBidSchema } from "@/lib/validations/bid";
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
				or(
					eq(accountJobs.accountId, ctx.account.id),
					eq(companyJobs.companyId, ctx.account.id)
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
				.select()
				.from(bids)
				.innerJoin(jobBids, eq(bids.id, jobBids.bidId))
				.where(eq(jobBids.jobId, jobId));

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
				.where(eq(bids.id, bidId))
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
				if (
					!ctx.ownedCompanies.map((c) => c.id).includes(bid.senderCompanyId)
				) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You are not the owner of the bidding company",
					});
				}
				const [newbid] = await tx
					.insert(bids)
					.values({
						...bid,
						priceUsd: bid.priceUsd.toString(), // Convert price to string
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

			// //verify bid ownership
			// const [bid ] = await ctx.db.select({
			// 	bid: bid
			// 	jobId: jobi
			// })



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
			const res = await ctx.db
				.update(bids)
				.set({ status: "rejected" })
				.where(eq(bids.id, bidId));
			return res;
		}),
});
