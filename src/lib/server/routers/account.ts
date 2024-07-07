import { accounts } from "@/lib/db/drizzle/schema";
import { eq, and, isNull, sql, not } from "drizzle-orm";
import { accountProcedure, router, userProcedure } from "../trpc";
import { NewAccountSchema, EditAccountSchema } from "@/lib/validations/account";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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
	searhAccountsByKeyword: accountProcedure
		.input(
			z.object({
				keywordQuery: z.string(),
				cursor: z.number().optional().default(1),
				pageSize: z.number().optional().default(10),
				includeDeleted: z.boolean().optional().default(false),
			})
		)
		.query(async ({ ctx, input }) => {
			const { keywordQuery, cursor: page, pageSize, includeDeleted } = input;

			const res = await ctx.db
				.select({
					id: accounts.id,
					username: accounts.username,
					deletedAt: accounts.deletedAt,
				})
				.from(accounts)
				.where(
					and(
						not(eq(accounts.id, ctx.account.id)),
						includeDeleted ? undefined : isNull(accounts.deletedAt),
						sql`accounts.english_search_vector @@ WEBSEARCH_TO_TSQUERY('english',${keywordQuery})`
					)
				)
				.orderBy(
					sql`ts_rank(accounts.english_search_vector, WEBSEARCH_TO_TSQUERY('english', ${keywordQuery}))`
				)
				.offset((page - 1) * pageSize)
				.limit(pageSize + 1);

			const hasNext = res.length > pageSize;
			const hasPrevious = page > 1;
			return {
				data: res.slice(0, pageSize),
				hasNext,
				hasPrevious,
				nextPage: hasNext ? page + 1 : null,
				previousPage: hasPrevious ? page - 1 : null,
			};
		}),
});
