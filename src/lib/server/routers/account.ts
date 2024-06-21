import { accounts } from "@/lib/db/drizzle/schema";
import { accountInsertSchema } from "@/lib/validations/db";
import { eq } from "drizzle-orm";
import { router, userProcedure } from "../trpc";

export const accountRouter = router({
	createAccount: userProcedure
		.input(accountInsertSchema)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(accounts).values({
				username: input.username,
				user_id: ctx.user.id,
			});
		}),
	getAccount: userProcedure.query(async ({ ctx }) => {
		const [account] = await ctx.db
			.select()
			.from(accounts)
			.where(eq(accounts.user_id, ctx.user.id));

		return account;
	}),
});
