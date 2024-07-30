import { router, accountProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import MessageQueryClient from "@/lib/db/queries/message";
import {
	UpdateRecipientSchema,
	NewMessageSchema,
} from "@/lib/db/queries/validation";
import CompanyQueryClient from "@/lib/db/queries/company";

export const messageRouter = router({
	createMessage: accountProcedure
		.input(
			NewMessageSchema.refine((data) => {
				return (
					(data.senderAccountId && !data.senderCompanyId) ||
					(!data.senderAccountId && data.senderCompanyId)
				);
			}, "senderAccountId or senderCompanyId is required but not both")
		)
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
			throw new TRPCError({
				code: "NOT_IMPLEMENTED",
				message: "This endpoint is not implemented",
				cause: new Error("This endpoint is not implemented 12123123"),
			});
			
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

			const rawData =
				await MessageQueryClient.GetExtendedManyReceivedByAccountId(
					accountId,
					keywordQuery,
					page,
					pageSize,
					includeRead,
					includeDeleted
				);

			const transformedData = rawData.data.map((message) => {
				const sender = message.senderAccount
					? message.senderAccount
					: message.senderCompany;

				if (!sender) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "sender not found",
					});
				}

				return {
					...message.messages,
					reciepient: message.reciepient,
					replyTo: message.replyTo,
					sender: {
						...sender,
						type: sender.type as "account" | "company",
					},
				};
			});

			return {
				...rawData,
				data: transformedData,
			};
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

			const rawData =
				await MessageQueryClient.GetExtendedManyReceivedByCompanyId(
					companyId,
					keywordQuery,
					page,
					pageSize,
					includeRead,
					includeDeleted
				);

			const transformedData = rawData.data.map((message) => {
				const sender = message.senderAccount
					? message.senderAccount
					: message.senderCompany;

				if (!sender) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "sender not found",
					});
				}

				return {
					...message.messages,
					replyTo: message.replyTo,
					reciepient: message.reciepient,
					sender: {
						...sender,
						type: sender.type as "account" | "company",
					},
				};
			});

			return {
				...rawData,
				data: transformedData,
			};
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
	getBasicById: accountProcedure
		.input(z.object({ messageId: z.string().uuid().optional() }))
		.query(async ({ ctx, input }) => {
			//TODO: add way more validation here
			if (!input.messageId) {
				return null;
			}

			return await MessageQueryClient.GetBasicById(input.messageId);
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
	getReciepientsByKeyword: accountProcedure
		.input(
			z.object({
				keyword: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			return await MessageQueryClient.GetRecipientsByKeyword(input.keyword);
		}),
});
