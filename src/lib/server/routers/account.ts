import { accountProcedure, router, userProcedure } from "../trpc";
import {
	NewAccountSchema,
	EditAccountSchema,
} from "@/lib/db/queries/validation";
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
	getAccountByUserId: userProcedure
		.input(
			z.object({
				userId: z.string().uuid(),
			})
		)
		.query(async ({ input }) => {
			return await AccountQueryClient.GetDetailedByUserId(input.userId);
		}),
	getLoggedInAccount: accountProcedure.query(async ({ ctx }) => {
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

	getAccountHistory: accountProcedure
		.input(
			z.object({
				accountId: z.string().uuid(),
				page: z.number().optional().default(1),
				pageSize: z.number().optional().default(10),
			})
		)
		.query(async ({ ctx, input }) => {
			if (ctx.account.id != input.accountId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "cannot get history for other account",
				});
			}

			return await AccountQueryClient.GetHistoryByAccountId(ctx.account.id, {
				page: input.page,
				pageSize: input.pageSize,
			});
		}),

	clearHistory: accountProcedure
		.input(z.object({ accountId: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			if (ctx.account.id != input.accountId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "cannot clear history for other account",
				});
			}

			await AccountQueryClient.ClearHistory(input.accountId);
		}),
});
