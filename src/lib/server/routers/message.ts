import { router, accountProcedure } from "../trpc";
import {
	messageAccountRecipients,
	messageCompanyRecipients,
	messages,
} from "@/lib/db/drizzle/schema";
import { eq, and, isNull, desc, inArray, or, isNotNull } from "drizzle-orm";
import { NewMessageSchema } from "@/lib/validations/message";
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
	getMessagesByAccountId: accountProcedure
		.input(
			z.object({
				accountId: z.string(),
				includeRead: z.boolean().optional().default(false),
				includeDeleted: z.boolean().optional().default(false),
			})
		)
		.query(async ({ ctx, input }) => {
			const { accountId, includeRead, includeDeleted } = input;

			if (ctx.account.id !== accountId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you cannot get messages for this account",
				});
			}

			const res = await ctx.db
				.select()
				.from(messages)
				.innerJoin(
					messageAccountRecipients,
					eq(messages.id, messageAccountRecipients.messageId)
				)
				.where(
					and(
						and(
							eq(messageAccountRecipients.accountId, input.accountId),
							includeRead ? undefined : isNull(messageAccountRecipients.readAt),
							includeDeleted
								? undefined
								: isNull(messageAccountRecipients.deletedAt)
						)
					)
				)
				.orderBy(desc(messages.createdAt));

			return res.map((message) => ({
				...message.messages,
			}));
		}),
	getReceivedMessagesByCompanyId: accountProcedure
		.input(
			z.object({
				companyId: z.string(),
				includeRead: z.boolean().optional().default(false),
				includeDeleted: z.boolean().optional().default(false),
			})
		)
		.query(async ({ ctx, input }) => {
			const { companyId, includeRead, includeDeleted } = input;

			const ownedCompanyIds =
				ctx.ownedCompanies?.map((company) => company.id) || [];

			if (!ownedCompanyIds.includes(companyId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you cannot get messages for this company",
				});
			}

			const res = await ctx.db
				.select()
				.from(messages)
				.innerJoin(
					messageCompanyRecipients,
					eq(messages.id, messageCompanyRecipients.messageId)
				)
				.where(
					and(
						eq(messageCompanyRecipients.companyId, input.companyId),
						includeRead ? undefined : isNull(messageCompanyRecipients.readAt),
						includeDeleted
							? undefined
							: isNull(messageCompanyRecipients.deletedAt)
					)
				)
				.orderBy(desc(messages.createdAt));

			return res.map((message) => ({
				...message.messages,
			}));
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
				accountId: z.string().optional(),
				companyId: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, accountId, companyId } = input;

			if (!accountId && !companyId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "you must provide an accountId or companyId",
				});
			}

			if (accountId) {
				if (ctx.account.id !== accountId) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "you cannot read this account message",
					});
				}

				await ctx.db
					.update(messageAccountRecipients)
					.set({ readAt: new Date().toISOString() })
					.where(eq(messageAccountRecipients.messageId, id));
			} else if (companyId) {
				const ownedCompanyIds =
					ctx.ownedCompanies?.map((company) => company.id) || [];

				if (!ownedCompanyIds.includes(companyId)) {
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
});
