import { router, accountProcedure } from "../trpc";
import {
	accounts,
	companies,
	messageAccountRecipients,
	messageCompanyRecipients,
	messages,
} from "@/lib/db/drizzle/schema";
import {
	eq,
	and,
	isNull,
	desc,
	ilike,
	isNotNull,
	or,
	sql,
	gt,
	not,
	inArray,
} from "drizzle-orm";
import { NewMessageSchema, ShowMessageSchema } from "@/lib/validations/message";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { count } from "drizzle-orm";
import { createMessage } from "./shared";

export const messageRouter = router({
	createMessage: accountProcedure
		.input(NewMessageSchema)
		.mutation(async ({ ctx, input }) => {
			createMessage(input, ctx, ctx.db);
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

			const res = await ctx.db
				.select({
					messages,
					readAt: messageAccountRecipients.readAt,
					deletedAt: messageAccountRecipients.deletedAt,
					senderCompany: {
						id: companies.id,
						name: companies.name,
						deletedAt: companies.deletedAt,
					},
					senderAccount: {
						id: accounts.id,
						name: accounts.username,
						deletedAt: accounts.deletedAt,
					},
				})
				.from(messages)
				.innerJoin(
					messageAccountRecipients,
					eq(messages.id, messageAccountRecipients.messageId)
				)
				.leftJoin(accounts, eq(messages.senderAccountId, accounts.id))
				.leftJoin(companies, eq(messages.senderCompanyId, companies.id))
				.where(
					and(
						eq(messageAccountRecipients.accountId, input.accountId),
						includeRead ? undefined : isNull(messageAccountRecipients.readAt),
						includeDeleted
							? undefined
							: isNull(messageAccountRecipients.deletedAt),
						keywordQuery
							? sql`messages.english_search_vector @@ WEBSEARCH_TO_TSQUERY('english',${keywordQuery})`
							: undefined
					)
				)
				.orderBy(
					keywordQuery
						? sql`ts_rank(messages.english_search_vector, WEBSEARCH_TO_TSQUERY('english', ${keywordQuery}))`
						: desc(messages.createdAt),
					desc(messages.createdAt)
				)
				.offset((page - 1) * pageSize)
				.limit(pageSize + 1);

			const out = res.map((message) => ({
				...message.messages,
				readAt: message.readAt,
				deletedAt: message.deletedAt,
				sender: message.messages.senderAccountId
					? {
							type: "account",
							...message.senderAccount,
					  }
					: {
							type: "company",
							...message.senderCompany,
					  },
			}));

			const hasNext = out.length > pageSize;
			const hasPrevious = page > 1;
			return {
				data: out.slice(0, pageSize),
				hasNext,
				hasPrevious,
				nextPage: hasNext ? page + 1 : null,
				previousPage: hasPrevious ? page - 1 : null,
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
			const ownedCompanyIds =
				ctx.ownedCompanies?.map((company) => company.id) || [];

			if (!ownedCompanyIds.includes(companyId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you cannot get messages for this company",
				});
			}

			const res = await ctx.db
				.select({
					messages,
					readAt: messageCompanyRecipients.readAt,
					deletedAt: messageCompanyRecipients.deletedAt,
					senderCompany: {
						id: companies.id,
						name: companies.name,
						deletedAt: companies.deletedAt,
					},
					senderAccount: {
						id: accounts.id,
						name: accounts.username,
						deletedAt: accounts.deletedAt,
					},
				})
				.from(messages)
				.innerJoin(
					messageCompanyRecipients,
					eq(messages.id, messageCompanyRecipients.messageId)
				)
				.leftJoin(accounts, eq(messages.senderAccountId, accounts.id))
				.leftJoin(companies, eq(messages.senderCompanyId, companies.id))
				.where(
					and(
						eq(messageCompanyRecipients.companyId, input.companyId),
						includeRead ? undefined : isNull(messageAccountRecipients.readAt),
						includeDeleted
							? undefined
							: isNull(messageAccountRecipients.deletedAt),
						keywordQuery
							? sql`messages.english_search_vector @@ WEBSEARCH_TO_TSQUERY('english',${keywordQuery})`
							: undefined
					)
				)
				.orderBy(
					keywordQuery
						? sql`ts_rank(messages.english_search_vector, WEBSEARCH_TO_TSQUERY('english', ${keywordQuery}))`
						: desc(messages.createdAt),
					desc(messages.createdAt)
				)
				.offset((page - 1) * pageSize)
				.limit(pageSize + 1);

			const out = res.map((message) => ({
				...message.messages,
				readAt: message.readAt,
				deletedAt: message.deletedAt,
				sender: message.messages.senderAccountId
					? {
							type: "account",
							...message.senderAccount,
					  }
					: {
							type: "company",
							...message.senderCompany,
					  },
			}));

			const hasNext = out.length > pageSize;
			const hasPrevious = page > 1;
			return {
				data: out.slice(0, pageSize),
				hasNext,
				hasPrevious,
				nextPage: hasNext ? page + 1 : null,
				previousPage: hasPrevious ? page - 1 : null,
			};
		}),
	getUnreadMessageCountByAccountId: accountProcedure
		.input(
			z.object({
				accountId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const [cnt] = await ctx.db
				.select({ count: count() })
				.from(messages)
				.innerJoin(
					messageAccountRecipients,
					eq(messages.id, messageAccountRecipients.messageId)
				)
				.where(
					and(
						eq(messageAccountRecipients.accountId, input.accountId),
						isNull(messageAccountRecipients.readAt),
						isNull(messageAccountRecipients.deletedAt)
					)
				)
				.groupBy(messageAccountRecipients.accountId);

			return cnt;
		}),
	getUnreadMessageCountByCompanyId: accountProcedure
		.input(
			z.object({
				companyId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const [cnt] = await ctx.db
				.select({ count: count() })
				.from(messages)
				.innerJoin(
					messageCompanyRecipients,
					eq(messages.id, messageCompanyRecipients.messageId)
				)
				.where(
					and(
						eq(messageCompanyRecipients.companyId, input.companyId),
						isNull(messageCompanyRecipients.readAt),
						isNull(messageCompanyRecipients.deletedAt)
					)
				)
				.groupBy(messageCompanyRecipients.companyId);

			return cnt;
		}),
	readMessage: accountProcedure
		.input(
			z.object({
				id: z.string(),
				recipient: z.union([
					z.object({
						accountId: z.string(),
					}),
					z.object({
						companyId: z.string(),
					}),
				]),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, recipient } = input;

			if ("accountId" in recipient) {
				if (ctx.account.id !== recipient.accountId) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "you cannot read this account message",
					});
				}

				await ctx.db
					.update(messageAccountRecipients)
					.set({ readAt: new Date().toISOString() })
					.where(eq(messageAccountRecipients.messageId, id));
			} else if ("companyId" in recipient) {
				const ownedCompanyIds =
					ctx.ownedCompanies?.map((company) => company.id) || [];

				if (!ownedCompanyIds.includes(recipient.companyId)) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "you cannot read this company message",
					});
				}

				await ctx.db
					.update(messageCompanyRecipients)
					.set({ readAt: new Date().toISOString() })
					.where(eq(messageCompanyRecipients.messageId, id));
			}
		}),
	deleteMessage: accountProcedure
		.input(
			z.object({
				id: z.string(),
				recipient: z.union([
					z.object({
						accountId: z.string(),
					}),
					z.object({
						companyId: z.string(),
					}),
				]),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, recipient } = input;

			if ("accountId" in recipient) {
				if (ctx.account.id !== recipient.accountId) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "you cannot delete this account message",
					});
				}

				await ctx.db
					.update(messageAccountRecipients)
					.set({ deletedAt: new Date().toISOString() })
					.where(
						and(
							eq(messageAccountRecipients.messageId, id),
							// We don't want to delete the message if it's already been deleted
							isNull(messageAccountRecipients.deletedAt)
						)
					);
			} else if ("companyId" in recipient) {
				const ownedCompanyIds =
					ctx.ownedCompanies?.map((company) => company.id) || [];

				if (!ownedCompanyIds.includes(recipient.companyId)) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "you cannot delete this company message",
					});
				}

				await ctx.db
					.update(messageCompanyRecipients)
					.set({ deletedAt: new Date().toISOString() })
					.where(
						and(
							eq(messageCompanyRecipients.messageId, id),
							// We don't want to delete the message if it's already been deleted
							isNull(messageCompanyRecipients.deletedAt)
						)
					);
			}
		}),
	unreadMessage: accountProcedure
		.input(
			z.object({
				id: z.string(),
				recipient: z.union([
					z.object({
						accountId: z.string(),
					}),
					z.object({
						companyId: z.string(),
					}),
				]),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, recipient } = input;

			if ("accountId" in recipient) {
				if (ctx.account.id !== recipient.accountId) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "you cannot unread this account message",
					});
				}

				await ctx.db
					.update(messageAccountRecipients)
					.set({ readAt: null })
					.where(eq(messageAccountRecipients.messageId, id));
			} else if ("companyId" in recipient) {
				const ownedCompanyIds =
					ctx.ownedCompanies?.map((company) => company.id) || [];

				if (!ownedCompanyIds.includes(recipient.companyId)) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "you cannot unread this company message",
					});
				}

				await ctx.db
					.update(messageCompanyRecipients)
					.set({ readAt: null })
					.where(eq(messageCompanyRecipients.messageId, id));
			}
		}),

});
