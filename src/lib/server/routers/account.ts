import { accounts } from "@/lib/db/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import { accountProcedure, router, userProcedure } from "../trpc";
import { NewAccountSchema, EditAccountSchema } from "@/lib/validations/account";
import { TRPCError } from "@trpc/server";

export const accountRouter = router({
	createAccount: userProcedure
		.input(NewAccountSchema)
		.mutation(async ({ ctx, input }) => {
			if (ctx.user.id != input.userId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "cannot create account for other user",
				});
			}

			await ctx.db.insert(accounts).values({
				...input,
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
	editAccount: accountProcedure
		.input(EditAccountSchema)
		.mutation(async ({ ctx, input }) => {
			const { id: accountId, ...account } = input;

			if (ctx.user.id != account.userId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "cannot edit account for other user",
				});
			}

			if (ctx.account.id != accountId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "cannot edit details for other account",
				});
			}

			await ctx.db
				.update(accounts)
				.set(input)
				.where(eq(accounts.id, accountId));
		}),
});
