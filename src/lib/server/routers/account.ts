import { accounts } from "@/lib/db/drizzle/schema";
import { accountInsertSchema } from "@/lib/validations/db";
import { eq, and, isNull } from "drizzle-orm";
import { router, userProcedure } from "../trpc";

export const accountRouter = router({
	createAccount: userProcedure
		.input(accountInsertSchema)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(accounts).values({
				username: input.username,
				userId: ctx.user.id,
			});
		}),
	getAccount: userProcedure.query(async ({ ctx }) => {
		const [account] = await ctx.db
			.select()
			.from(accounts)
			.where(and(eq(accounts.userId, ctx.user.id), isNull(accounts.deletedAt)));

		return account;
	}),
});
