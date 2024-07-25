import { accountProcedure, router, userProcedure } from "../trpc";
import { NewAccountSchema, EditAccountSchema } from "@/lib/db/queries/account";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import AccountQueryClient from "@/lib/db/queries/account";

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

			return await AccountQueryClient.Create(input);
		}),
	getAccount: userProcedure.query(async ({ ctx }) => {
		return await AccountQueryClient.GetDetailedByUserId(ctx.user.id);
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

			return await AccountQueryClient.Update(input);
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
			const { keywordQuery, cursor, pageSize, includeDeleted } = input;

			return await AccountQueryClient.GetBasicManyByKeyword(
				ctx.account.id,
				keywordQuery,
				cursor,
				pageSize,
				includeDeleted
			);
		}),
});
