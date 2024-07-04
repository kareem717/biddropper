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
			})
		)
		.query(async ({ ctx, input }) => {
			const { accountId, includeRead } = input;

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
						eq(messageAccountRecipients.accountId, input.accountId),
						includeRead ? undefined : isNull(messages.readAt),
						isNull(messages.deletedAt)
					)
				)
				.orderBy(desc(messages.createdAt));

			return res.map((message) => ({
				...message.messages,
			}));
		}),
	getMessagesByCompanyId: accountProcedure
		.input(
			z.object({
				companyId: z.string(),
				includeRead: z.boolean().optional().default(false),
			})
		)
		.query(async ({ ctx, input }) => {
			const { companyId, includeRead } = input;

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
						includeRead ? undefined : isNull(messages.readAt),
						isNull(messages.deletedAt)
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
						isNull(messages.readAt),
						isNull(messages.deletedAt)
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
						isNull(messages.readAt),
						isNull(messages.deletedAt)
					)
				)
				.groupBy(messageCompanyRecipients.companyId);

			return cnt;
		}),
	readMessage: accountProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			const ownedCompanyIds =
				ctx.ownedCompanies?.map((company) => company.id) || [];

			const messageExists = await ctx.db
				.select()
				.from(messages)
				.leftJoin(
					messageAccountRecipients,
					and(
						eq(messages.id, messageAccountRecipients.messageId),
						eq(messageAccountRecipients.accountId, ctx.account.id)
					)
				)
				.leftJoin(
					messageCompanyRecipients,
					and(
						eq(messages.id, messageCompanyRecipients.messageId),
						inArray(messageCompanyRecipients.companyId, ownedCompanyIds)
					)
				)
				.where(
					and(
						eq(messages.id, id),
						isNull(messages.deletedAt),
						or(
							isNotNull(messageAccountRecipients.accountId),
							isNotNull(messageCompanyRecipients.companyId)
						)
					)
				)
				.limit(1);

			if (messageExists) {
				await ctx.db
					.update(messages)
					.set({ readAt: new Date().toISOString() })
					.where(eq(messages.id, id));
			}
		}),
});
