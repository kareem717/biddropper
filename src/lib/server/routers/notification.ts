import { router, accountProcedure } from "../trpc";
import { notifications } from "@/lib/db/drizzle/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { NewNotificationSchema } from "@/lib/validations/notification";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { count } from "drizzle-orm";

export const notificationRouter = router({
	createNotification: accountProcedure
		.input(NewNotificationSchema)
		.mutation(async ({ ctx, input }) => {
			if (ctx.account.id !== input.accountId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "you cannot create a notification for this account",
				});
			}

			const res = await ctx.db.insert(notifications).values(input);
			return res;
		}),
	getNotificationsByAcoount: accountProcedure
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
					message: "you cannot get notifications for this account",
				});
			}

			return await ctx.db
				.select()
				.from(notifications)
				.where(
					and(
						eq(notifications.accountId, input.accountId),
						eq(notifications.isRead, includeRead),
						isNull(notifications.deletedAt)
					)
				)
				.orderBy(desc(notifications.createdAt));
		}),
	getUnreadNotificationCount: accountProcedure.query(async ({ ctx }) => {
		const [cnt] = await ctx.db
			.select({ count: count() })
			.from(notifications)
			.where(
				and(
					eq(notifications.accountId, ctx.account.id),
					eq(notifications.isRead, false),
					isNull(notifications.deletedAt)
				)
			)
			.groupBy(notifications.accountId);

		return cnt;
	}),

	readNotification: accountProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			await ctx.db
				.update(notifications)
				.set({ isRead: true })
				.where(
					and(
						eq(notifications.id, id),
						eq(notifications.accountId, ctx.account.id),
						isNull(notifications.deletedAt)
					)
				);
		}),
});
