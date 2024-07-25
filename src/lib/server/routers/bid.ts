import {
	bids,
	jobBids,
	companies,
	bidStatus,
	messages,
} from "@/lib/db/drizzle/schema";
import { router, companyOwnerProcedure } from "../trpc";
import {
	NewBidSchema,
	EditBidSchema,
	BidFilterSchema,
} from "@/lib/db/queries/validation";
import { TRPCError } from "@trpc/server";
import { eq, and, not } from "drizzle-orm";
import { accountProcedure } from "../trpc";
import { z } from "zod";
import { OffsetPaginationOptionsSchema } from "@/lib/db/queries";
import BidQueryClient from "@/lib/db/queries/bid";
import MessageQueryClient from "@/lib/db/queries/message";

export const bidRouter = router({
	getSentBidsByCompanyId: companyOwnerProcedure
		.input(
			z.object({
				filter: BidFilterSchema,
				pagination: OffsetPaginationOptionsSchema,
				companyId: z.string().uuid(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { filter, pagination, companyId } = input;

			const ownedCompanyIds = ctx.ownedCompanies.map((c) => c.id);

			if (!ownedCompanyIds.includes(companyId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you are not the owner of the company",
				});
			}

			return await BidQueryClient.GetExtendedManySentByCompanyId(
				filter,
				pagination,
				companyId
			);
		}),
	getReceivedBidsByCompanyId: companyOwnerProcedure
		.input(
			z.object({
				filter: BidFilterSchema,
				pagination: OffsetPaginationOptionsSchema,
				companyId: z.string().uuid(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { filter, pagination, companyId } = input;

			const ownedCompanyIds = ctx.ownedCompanies.map((c) => c.id) || [];

			if (!ownedCompanyIds.includes(companyId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you are not the owner of the company",
				});
			}

			return await BidQueryClient.GetExtendedManyReceivedByCompanyId(
				filter,
				pagination,
				companyId
			);
		}),
	getReceivedBidsByAccountId: accountProcedure
		.input(
			z.object({
				filter: BidFilterSchema,
				pagination: OffsetPaginationOptionsSchema,
				accountId: z.string().uuid(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { filter, pagination, accountId } = input;

			if (ctx.account.id !== accountId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you are not the owner of the company",
				});
			}

			return await BidQueryClient.GetExtendedManyReceivedByAccountId(
				filter,
				pagination,
				accountId
			);
		}),
	getRecievedBidsByJobId: accountProcedure
		.input(
			z.object({
				filter: BidFilterSchema.omit({ jobIdFilter: true }),
				jobId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { filter, jobId } = input;

			return await BidQueryClient.GetExtendedManyReceivedByJobId(filter, jobId);
		}),
	getBidFull: accountProcedure
		.input(z.object({ bidId: z.string() }))
		.query(async ({ input }) => {
			const { bidId } = input;

			const [bid] = await BidQueryClient.GetExtendedManyById([bidId]);

			return bid;
		}),
	createBid: companyOwnerProcedure
		.input(NewBidSchema)
		.mutation(async ({ ctx, input }) => {
			const newId = await BidQueryClient.Create(input, ctx.account.id);
			return newId;
		}),
	acceptBid: companyOwnerProcedure
		.input(z.object({ bidId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { bidId } = input;

			const [bid] = await BidQueryClient.GetExtendedManyById([bidId]);

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
			const isAccountOwner =
				"accountId" in bid.job.owner &&
				bid.job.owner.accountId === ctx.account.id;
			const isCompanyOwner =
				"companyId" in bid.job.owner &&
				ctx.ownedCompanies
					.map((c) => c.id)
					.includes(bid.job.owner.companyId ?? "");

			if (!isAccountOwner && !isCompanyOwner) {
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
				await BidQueryClient.withCaller(tx).RejectMany(
					otherBidsOnSameJob.map((b) => b.id),
					ctx.account.id
				);

				//notify the rejected bidders
				await tx.insert(messages).values(
					otherBidsOnSameJob.map((b) => ({
						accountId: b.senderCompany.ownerAccountId,
						title: "Bid rejected",
						description: `Your bid for ${bid.job.title} has been rejected`,
					}))
				);

				await BidQueryClient.withCaller(tx).UpdateStatusMany(
					[bidId],
					"accepted",
					true
				);

				const accountId = bid.senderCompany.ownerAccountId;

				if (!accountId) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "account id not found",
					});
				}

				await MessageQueryClient.withCaller(tx).Create({
					senderAccountId: accountId,
					recipients: {
						accountIds: [ctx.account.id],
						companyIds: [],
					},
					title: "Bid accepted",
					description: `You have been accepted for ${bid.job.title}!`,
				});
			});
		}),
	withdrawBid: companyOwnerProcedure
		.input(z.object({ bidId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { bidId } = input;

			const [bid] = await BidQueryClient.GetExtendedManyById([bidId]);

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
				await BidQueryClient.withCaller(tx).UpdateStatusMany(
					[bidId],
					"withdrawn",
					true
				);

				let accountId: string | undefined;

				if ("accountId" in bid.job.owner) {
					accountId = bid.job.owner.accountId;
				} else if ("companyId" in bid.job.owner) {
					accountId = bid.job.owner.ownerAccountId;
				}

				if (!accountId) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "account id not found",
					});
				}

				await MessageQueryClient.withCaller(tx).Create({
					senderAccountId: accountId,
					recipients: {
						accountIds: [ctx.account.id],
						companyIds: [],
					},
					title: "Bid withdrawn",
					description: `A bid for the job ${bid.job.title} has been withdrawn`,
				});
			});
		}),
	rejectBid: companyOwnerProcedure
		.input(z.object({ bidId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { bidId } = input;

			return await BidQueryClient.RejectMany([bidId], ctx.account.id);
		}),
	editBid: companyOwnerProcedure
		.input(EditBidSchema)
		.mutation(async ({ ctx, input }) => {
			return await BidQueryClient.Update(input, ctx.account.id);
		}),
	getHottestBidsByAccountId: accountProcedure
		.input(
			z.object({
				accountId: z.string().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { accountId } = input;

			if (accountId !== ctx.account.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you are not the owner of the account",
				});
			}

			return await BidQueryClient.GetHottestManyByAccountId(ctx.account.id);
		}),
});
