import { router, accountProcedure } from "../trpc";
import { NewMessageSchema } from "@/lib/db/queries/message";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import MessageQueryClient from "@/lib/db/queries/message";
import { UpdateRecipientSchema } from "@/lib/db/queries/message";
import CompanyQueryClient from "@/lib/db/queries/company";

export const messageRouter = router({
	createMessage: accountProcedure
		.input(NewMessageSchema)
		.mutation(async ({ input }) => {
			return await MessageQueryClient.Create(input);
		}),
	getReceivedMessagesByAccountId: accountProcedure
		.input(
			z.object({
				accountId: z.string().uuid(),
				keywordQuery: z.string().optional(),
				cursor: z.number().optional().default(1),
				pageSize: z.number().optional().default(10),
				includeRead: z.boolean().optional().default(false),
				includeDeleted: z.boolean().optional().default(false),
			})
		)
		.query(async ({ ctx, input }) => {
			const {
				accountId,
				keywordQuery,
				cursor: page,
				pageSize,
				includeRead,
				includeDeleted,
			} = input;

			if (ctx.account.id !== accountId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you cannot get messages for this account",
				});
			}

			return await MessageQueryClient.GetExtendedManyReceivedByAccountId(
				accountId,
				keywordQuery,
				page,
				pageSize,
				includeRead,
				includeDeleted
			);
		}),
	getReceivedMessagesByCompanyId: accountProcedure
		.input(
			z.object({
				companyId: z.string(),
				keywordQuery: z.string().optional(),
				cursor: z.number().optional().default(1),
				pageSize: z.number().optional().default(10),
				includeRead: z.boolean().optional().default(false),
				includeDeleted: z.boolean().optional().default(false),
			})
		)
		.query(async ({ ctx, input }) => {
			const {
				companyId,
				keywordQuery,
				cursor: page,
				pageSize,
				includeRead,
				includeDeleted,
			} = input;

			const ownedCompanies = await CompanyQueryClient.GetDetailedManyByOwnerId(
				ctx.account.id
			);
			if (!ownedCompanies.some((company) => company.id === companyId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you cannot get messages for this company",
				});
			}

			return await MessageQueryClient.GetExtendedManyReceivedByCompanyId(
				companyId,
				keywordQuery,
				page,
				pageSize,
				includeRead,
				includeDeleted
			);
		}),
	getUnreadMessageCountByAccountId: accountProcedure
		.input(
			z.object({
				accountId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { accountId } = input;

			if (ctx.account.id !== accountId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you cannot get unread message count for this account",
				});
			}

			return await MessageQueryClient.GetUnreadCountByAccountId(accountId);
		}),
	getUnreadMessageCountByCompanyId: accountProcedure
		.input(
			z.object({
				companyId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { companyId } = input;

			const ownedCompanies = await CompanyQueryClient.GetDetailedManyByOwnerId(
				ctx.account.id
			);
			if (!ownedCompanies.some((company) => company.id === companyId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you cannot get unread message count for this company",
				});
			}

			return await MessageQueryClient.GetUnreadCountByCompanyId(companyId);
		}),
	readMessage: accountProcedure
		.input(UpdateRecipientSchema)
		.mutation(async ({ ctx, input }) => {
			const { recipient } = input;

			if ("accountId" in recipient) {
				if (ctx.account.id !== recipient.accountId) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "you cannot read this account message",
					});
				}
			} else if ("companyId" in recipient) {
				const ownedCompanies =
					await CompanyQueryClient.GetDetailedManyByOwnerId(ctx.account.id);
				if (
					!ownedCompanies.some((company) => company.id === recipient.companyId)
				) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "you cannot read this company message",
					});
				}
			}

			return await MessageQueryClient.UpdateRecipient({
				messageId: input.messageId,
				recipient: input.recipient,
				readAt: new Date().toISOString(),
			});
		}),
	deleteMessage: accountProcedure
		.input(UpdateRecipientSchema)
		.mutation(async ({ ctx, input }) => {
			const { recipient } = input;

			if ("accountId" in recipient) {
				if (ctx.account.id !== recipient.accountId) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "you cannot read this account message",
					});
				}
			} else if ("companyId" in recipient) {
				const ownedCompanies =
					await CompanyQueryClient.GetDetailedManyByOwnerId(ctx.account.id);
				if (
					!ownedCompanies.some((company) => company.id === recipient.companyId)
				) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "you cannot read this company message",
					});
				}
			}

			return await MessageQueryClient.UpdateRecipient({
				messageId: input.messageId,
				recipient: input.recipient,
				deletedAt: new Date().toISOString(),
			});
		}),
	unreadMessage: accountProcedure
		.input(UpdateRecipientSchema)
		.mutation(async ({ ctx, input }) => {
			const { recipient } = input;
			if ("accountId" in recipient) {
				if (ctx.account.id !== recipient.accountId) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "you cannot read this account message",
					});
				}
			} else if ("companyId" in recipient) {
				const ownedCompanies =
					await CompanyQueryClient.GetDetailedManyByOwnerId(ctx.account.id);
				if (
					!ownedCompanies.some((company) => company.id === recipient.companyId)
				) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "you cannot read this company message",
					});
				}
			}

			return await MessageQueryClient.UpdateRecipient({
				messageId: input.messageId,
				recipient: input.recipient,
				readAt: null,
			});
		}),
});
