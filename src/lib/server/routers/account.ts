import { accounts } from "@/lib/db/migrations/schema";
import { accountInsertSchema } from "@/lib/validation/db";
import { authProcedure, router } from "../trpc";
import { eq } from "drizzle-orm";

export const accountRouter = router({
	createUserAccount: authProcedure
		.input(accountInsertSchema)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(accounts).values({
				username: input.username,
				description: input.description,
				user_id: ctx.user.id,
			});
		}),
	getUserAccount: authProcedure.query(async ({ ctx }) => {
		const [account] = await ctx.db
			.select()
			.from(accounts)
			.where(eq(accounts.user_id, ctx.user.id));

		return account;
	}),
});
