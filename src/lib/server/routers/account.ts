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
					code: "FORBIDDEN",
					message: "Cannot create account for another user",
				});
			}

			try {
				return await AccountQueryClient.Create(input);
			} catch (error) {
				console.error(error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create account",
					cause: error,
				});
			}
		}),
	getAccountByUserId: userProcedure
		.input(
			z.object({
				userId: z.string().uuid(),
			})
		)
		.query(async ({ input }) => {
			try {
				return await AccountQueryClient.GetDetailedByUserId(input.userId);
			} catch (error) {
				console.error(error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to get account",
					cause: error,
				});
			}
		}),
	getLoggedInAccount: accountProcedure.query(async ({ ctx }) => {
		try {
			return await AccountQueryClient.GetDetailedByUserId(ctx.user.id);
		} catch (error) {
			console.error(error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to get logged in account",
				cause: error,
			});
		}
	}),
	editAccount: accountProcedure
		.input(EditAccountSchema)
		.mutation(async ({ ctx, input }) => {
			const { id: accountId, ...account } = input;

			if (ctx.account.id != accountId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Cannot edit details for other account",
				});
			}

			if (ctx.user.id != account.userId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot transfer account ownership",
				});
			}

			try {
				return await AccountQueryClient.Update(input);
			} catch (error) {
				console.error(error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to edit account",
					cause: error,
				});
			}
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

			try {
				return await AccountQueryClient.GetBasicManyByKeyword(
					ctx.account.id,
					keywordQuery,
					cursor,
					pageSize,
					includeDeleted
				);
			} catch (error) {
				console.error(error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to search accounts",
					cause: error,
				});
			}
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

			try {
				return await AccountQueryClient.GetHistoryByAccountId(ctx.account.id, {
					page: input.page,
					pageSize: input.pageSize,
				});
			} catch (error) {
				console.error(error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to get account history",
					cause: error,
				});
			}
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

			try {
				await AccountQueryClient.ClearHistory(input.accountId);
			} catch (error) {
				console.error(error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to clear account history",
					cause: error,
				});
			}
		}),
});
