import { router, accountProcedure } from "../trpc";
import { messages } from "@/lib/db/drizzle/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { NewMessageSchema } from "@/lib/validations/message";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { count } from "drizzle-orm";

export const messageRouter = router({
	createMessage: accountProcedure
		.input(NewMessageSchema)
		.mutation(async ({ ctx, input }) => {
			if (ctx.account.id !== input.accountId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you cannot create a messages for this account",
				});
			}

			const res = await ctx.db.insert(messages).values(input);
			return res;
		}),
	getMessagesByAcoount: accountProcedure
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

			return await ctx.db
				.select()
				.from(messages)
				.where(
					and(
						eq(messages.accountId, input.accountId),
						includeRead ? undefined : isNull(messages.readAt),
						isNull(messages.deletedAt)
					)
				)
				.orderBy(desc(messages.createdAt));
		}),
	getUnreadMessageCount: accountProcedure.query(async ({ ctx }) => {
		const [cnt] = await ctx.db
			.select({ count: count() })
			.from(messages)
			.where(
				and(
					eq(messages.accountId, ctx.account.id),
					isNull(messages.readAt),
					isNull(messages.deletedAt)
				)
			)
			.groupBy(messages.accountId);

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

			await ctx.db
				.update(messages)
				.set({ readAt: new Date().toISOString() })
				.where(
					and(
						eq(messages.id, id),
						eq(messages.accountId, ctx.account.id),
						isNull(messages.deletedAt)
					)
				);
		}),
});
