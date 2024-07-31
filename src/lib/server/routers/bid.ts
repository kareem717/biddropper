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

			try {
				return await BidQueryClient.GetExtendedManySentByCompanyId(
					filter,
					pagination,
					companyId
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while fetching your sent bids",
					cause: error,
				});
			}
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

			try {
				return await BidQueryClient.GetExtendedManyReceivedByCompanyId(
					filter,
					pagination,
					companyId
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while fetching your received bids",
					cause: error,
				});
			}
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
					message: "You are not the owner of the account",
				});
			}

			try {
				return await BidQueryClient.GetExtendedManyReceivedByAccountId(
					filter,
					pagination,
					accountId
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while fetching received bids",
					cause: error,
				});
			}
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

			try {
				return await BidQueryClient.GetExtendedManyReceivedByJobId(
					filter,
					jobId
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while fetching received bids for the job",
					cause: error,
				});
			}
		}),
	getBidFull: accountProcedure
		.input(z.object({ bidId: z.string() }))
		.query(async ({ input }) => {
			const { bidId } = input;

			try {
				const [bid] = await BidQueryClient.GetExtendedManyById([bidId]);
				return bid;
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while fetching the bid",
					cause: error,
				});
			}
		}),
	createBid: companyOwnerProcedure
		.input(NewBidSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const newId = await BidQueryClient.Create(input, ctx.account.id);
				return newId;
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while creating the bid",
					cause: error,
				});
			}
		}),
	acceptBid: companyOwnerProcedure
		.input(z.object({ bidId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { bidId } = input;

			let bid;
			try {
				[bid] = await BidQueryClient.GetExtendedManyById([bidId]);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while fetching the bid",
					cause: error,
				});
			}

			if (!bid) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No bid found",
				});
			}

			if (bid.bids.status !== bidStatus.enumValues[0]) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "The bid is not pending",
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
					message: "You are not the owner of the job",
				});
			}

			try {
				await ctx.db.transaction(async (tx) => {
					let otherBidsOnSameJob;
					try {
						otherBidsOnSameJob = await tx
							.select({
								id: bids.id,
								senderCompany: {
									ownerAccountId: companies.ownerId,
								},
							})
							.from(bids)
							.innerJoin(jobBids, eq(bids.id, jobBids.bidId))
							.innerJoin(companies, eq(bids.senderCompanyId, companies.id))
							.where(
								and(eq(jobBids.jobId, bid.job.id), not(eq(bids.id, bidId)))
							);
					} catch (error) {
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: "An error verifying other bids on the same job",
							cause: error,
						});
					}

					try {
						// reject all other pending bids on the same job
						await BidQueryClient.withCaller(tx).RejectMany(
							otherBidsOnSameJob.map((b) => b.id),
							ctx.account.id
						);
					} catch (error) {
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: "An error rejecting other bids on the same job",
							cause: error,
						});
					}

					try {
						//notify the rejected bidders
						await tx.insert(messages).values(
							otherBidsOnSameJob.map((b) => ({
								accountId: b.senderCompany.ownerAccountId,
								title: "Bid rejected",
								description: `Your bid for ${bid.job.title} has been rejected`,
							}))
						);
					} catch (error) {
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: "An error occurred while notifying rejected bidders",
							cause: error,
						});
					}

					try {
						await BidQueryClient.withCaller(tx).UpdateStatusMany(
							[bidId],
							"accepted",
							true
						);
					} catch (error) {
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: "An error occurred while accepting the bid",
							cause: error,
						});
					}

					const accountId = bid.senderCompany.ownerAccountId;

					if (!accountId) {
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: "An error occurred while accepting the bid",
							cause: new Error("account id not found"),
						});
					}

					try {
						await MessageQueryClient.withCaller(tx).Create({
							senderAccountId: accountId,
							recipients: {
								accountIds: [ctx.account.id],
								companyIds: [],
							},
							title: "Bid accepted",
							description: `You have been accepted for ${bid.job.title}!`,
						});
					} catch (error) {
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: "An error occurred while processing the bid acceptance",
							cause: error,
						});
					}
				});
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while accepting the bid",
					cause: error,
				});
			}
		}),
	withdrawBid: companyOwnerProcedure
		.input(z.object({ bidId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { bidId } = input;

			const [bid] = await BidQueryClient.GetExtendedManyById([bidId]);

			if (!bid) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "The bid was not found",
				});
			}

			// Verify that the bid is from a company owned by the current account
			if (
				ctx.ownedCompanies.map((c) => c.id).includes(bid.senderCompany.id || "")
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not the owner of the company who sent the bid",
				});
			}

			if (bid.bids.status !== bidStatus.enumValues[0]) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "The bid is not pending",
				});
			}

			try {
				await ctx.db.transaction(async (tx) => {
					try {
						await BidQueryClient.withCaller(tx).UpdateStatusMany(
							[bidId],
							"withdrawn",
							true
						);
					} catch (error) {
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: "An error occurred while withdrawing the bid",
							cause: error,
						});
					}

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

					try {
						await MessageQueryClient.withCaller(tx).Create({
							senderAccountId: accountId,
							recipients: {
								accountIds: [ctx.account.id],
								companyIds: [],
							},
							title: "Bid withdrawn",
							description: `A bid for the job ${bid.job.title} has been withdrawn`,
						});
					} catch (error) {
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: "An error occurred while notifying the job owner",
							cause: error,
						});
					}
				});
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while withdrawing the bid",
					cause: error,
				});
			}
		}),
	rejectBid: companyOwnerProcedure
		.input(z.object({ bidId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { bidId } = input;

			try {
				return await BidQueryClient.RejectMany([bidId], ctx.account.id);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while rejecting the bid",
					cause: error,
				});
			}
		}),
	editBid: companyOwnerProcedure
		.input(EditBidSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				return await BidQueryClient.Update(input, ctx.account.id);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while editing the bid",
					cause: error,
				});
			}
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

			try {
				return await BidQueryClient.GetHottestManyByAccountId(ctx.account.id);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while fetching the hottest bids",
					cause: error,
				});
			}
		}),

	getHottestBidsByCompanyId: companyOwnerProcedure
		.input(
			z.object({
				companyId: z.string().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { companyId } = input;

			if (!ctx.ownedCompanies.some((c) => c.id === companyId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You're not able to access this company's bid data",
				});
			}

			try {
				return await BidQueryClient.GetHottestManyByAccountId(ctx.account.id);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while fetching the hottest bids",
					cause: error,
				});
			}
		}),
});
