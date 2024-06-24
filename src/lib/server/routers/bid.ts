import {
	account_jobs,
	bids,
	company_jobs,
	job_bids,
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
				and(eq(bids.sender_company_id, ctx.account.id), isNull(bids.deleted_at))
			)
			.innerJoin(job_bids, eq(bids.id, job_bids.bid_id));
		return res;
	}),
	getAccountReceivedBids: accountProcedure.query(async ({ ctx }) => {
		const ownedJobIds = await ctx.db
			.select({
				job_id: jobs.id,
			})
			.from(jobs)
			.leftJoin(account_jobs, eq(jobs.id, account_jobs.job_id))
			.leftJoin(company_jobs, eq(jobs.id, company_jobs.job_id))
			.where(
				or(
					eq(account_jobs.account_id, ctx.account.id),
					eq(company_jobs.company_id, ctx.account.id)
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
					isNull(bids.deleted_at),
					not(eq(bids.status, "withdrawn")),
					inArray(
						job_bids.job_id,
						ownedJobIds.map((j) => j.job_id)
					)
				)
			)
			.innerJoin(job_bids, eq(bids.id, job_bids.bid_id));
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
				.innerJoin(job_bids, eq(bids.id, job_bids.bid_id))
				.where(eq(job_bids.job_id, jobId));

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
						owner_account_id: account_jobs.account_id,
						owner_company_id: company_jobs.company_id,
					},
					sender_company_name: companies.name,
				})
				.from(bids)
				.where(eq(bids.id, bidId))
				.leftJoin(job_bids, eq(bids.id, job_bids.bid_id))
				.innerJoin(jobs, eq(job_bids.job_id, jobs.id))
				.leftJoin(account_jobs, eq(jobs.id, account_jobs.job_id))
				.leftJoin(company_jobs, eq(jobs.id, company_jobs.job_id))
				.innerJoin(companies, eq(bids.sender_company_id, companies.id));
			return res;
		}),
	createBid: companyOwnerProcedure
		.input(NewBidSchema)
		.mutation(async ({ ctx, input }) => {
			const { job_id, ...bid } = input;
			const newId = await ctx.db.transaction(async (tx) => {
				if (
					!ctx.ownedCompanies.map((c) => c.id).includes(bid.sender_company_id)
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
						price_usd: bid.price_usd.toString(), // Convert price to string
					})
					.returning({ id: bids.id });

				await tx.insert(job_bids).values({
					job_id,
					bid_id: newbid.id,
				});

				return newbid.id;
			});

			return newId;
		}),
});
