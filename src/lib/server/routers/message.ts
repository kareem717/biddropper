import { router, accountProcedure, companyOwnerProcedure } from "../trpc";
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
			try {
				return await MessageQueryClient.Create(input);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create message",
					cause: error,
				});
			}
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

			let rawData;
			try {
				rawData = await MessageQueryClient.GetExtendedManyReceivedByAccountId(
					accountId,
					keywordQuery,
					page,
					pageSize,
					includeRead,
					includeDeleted
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to get received messages",
					cause: error,
				});
			}

			try {
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
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occured processing the data",
					cause: error,
				});
			}
		}),
	getReceivedMessagesByCompanyId: companyOwnerProcedure
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

			if (!ctx.ownedCompanies.some((company) => company.id === companyId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you cannot get messages for this company",
				});
			}

			let rawData;
			try {
				rawData = await MessageQueryClient.GetExtendedManyReceivedByCompanyId(
					companyId,
					keywordQuery,
					page,
					pageSize,
					includeRead,
					includeDeleted
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to get received messages by company",
					cause: error,
				});
			}

			let transformedData;
			try {
				transformedData = rawData.data.map((message) => {
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
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occured processing the data",
					cause: error,
				});
			}

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

			try {
				const cnt = await MessageQueryClient.GetUnreadCountByAccountId(
					accountId
				);
				return cnt || 0;
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to get unread message count",
					cause: error,
				});
			}
		}),
	getBasicById: accountProcedure
		.input(z.object({ messageId: z.string().uuid().optional() }))
		.query(async ({ ctx, input }) => {
			//TODO: add way more validation here
			if (!input.messageId) {
				return undefined;
			}

			try {
				return await MessageQueryClient.GetBasicById(input.messageId);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to get message by ID",
					cause: error,
				});
			}
		}),
	getUnreadMessageCountByCompanyId: accountProcedure
		.input(
			z.object({
				companyId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { companyId } = input;

			if (!ctx.ownedCompanies?.some((company) => company.id === companyId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You cannot get unread message count for this company",
				});
			}

			try {
				return await MessageQueryClient.GetUnreadCountByCompanyId(companyId);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to get unread message count by company",
					cause: error,
				});
			}
		}),
	readMessage: accountProcedure
		.input(UpdateRecipientSchema.omit({ readAt: true, deletedAt: true }))
		.mutation(async ({ ctx, input }) => {
			const { recipient } = input;

			if ("accountId" in recipient) {
				if (ctx.account.id !== recipient.accountId) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You cannot read this account message",
					});
				}
			} else if ("companyId" in recipient) {
				if (
					!ctx.ownedCompanies?.some(
						(company) => company.id === recipient.companyId
					)
				) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You cannot read this company message",
					});
				}
			}

			try {
				return await MessageQueryClient.UpdateRecipient({
					messageId: input.messageId,
					recipient: input.recipient,
					readAt: new Date().toISOString(),
				});
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to read message",
					cause: error,
				});
			}
		}),
	deleteMessage: accountProcedure
		.input(UpdateRecipientSchema)
		.mutation(async ({ ctx, input }) => {
			const { recipient } = input;

			if ("accountId" in recipient) {
				if (ctx.account.id !== recipient.accountId) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You cannot read this account message",
					});
				}
			} else if ("companyId" in recipient) {
				if (
					!ctx.ownedCompanies?.some(
						(company) => company.id === recipient.companyId
					)
				) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You cannot read this company message",
					});
				}
			}

			try {
				return await MessageQueryClient.UpdateRecipient({
					messageId: input.messageId,
					recipient: input.recipient,
					deletedAt: new Date().toISOString(),
				});
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to delete message",
					cause: error,
				});
			}
		}),
	unreadMessage: accountProcedure
		.input(UpdateRecipientSchema.omit({ readAt: true, deletedAt: true }))
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
				if (
					!ctx.ownedCompanies?.some(
						(company) => company.id === recipient.companyId
					)
				) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "you cannot read this company message",
					});
				}
			}

			try {
				return await MessageQueryClient.UpdateRecipient({
					messageId: input.messageId,
					recipient: input.recipient,
					readAt: null,
				});
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to unread message",
					cause: error,
				});
			}
		}),
	getReciepientsByKeyword: accountProcedure
		.input(
			z.object({
				keyword: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			try {
				return await MessageQueryClient.GetRecipientsByKeyword(input.keyword);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to get recipients by keyword",
					cause: error,
				});
			}
		}),
});
