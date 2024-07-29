import { router, accountProcedure, companyOwnerProcedure } from "../trpc";
import {
	EditCompanySchema,
	NewCompanySchema,
} from "@/lib/db/queries/validation";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import CompanyQueryClient from "@/lib/db/queries/company";
import AnalyticQueryClient from "@/lib/db/queries/analytics";

export const companyRouter = router({
	getOwnedCompanies: accountProcedure
		.input(
			z.object({
				includeDeleted: z.boolean().optional().default(false),
			})
		)
		.query(async ({ ctx, input }) => {
			return await CompanyQueryClient.GetDetailedManyByOwnerId(
				ctx.account.id,
				input.includeDeleted
			);
		}),
	getCompanyById: accountProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			return await CompanyQueryClient.GetDetailedById(input.id);
		}),
	getCompanyFull: accountProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			return await CompanyQueryClient.GetExtendedById(input.id);
		}),

	createCompany: accountProcedure
		.input(NewCompanySchema)
		.mutation(async ({ ctx, input }) => {
			if (input.industries.length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "industries are required",
				});
			}

			if (input.ownerId !== ctx.account.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "owner must be the current account",
				});
			}

			return await CompanyQueryClient.Create(input);
		}),
	editCompany: companyOwnerProcedure
		.input(EditCompanySchema)
		.mutation(async ({ ctx, input }) => {
			if (!input.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "company id is required",
				});
			}

			const company = await CompanyQueryClient.GetDetailedById(input.id);

			if (!company) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "company not found",
				});
			}

			// verify user owns company
			if (company.ownerId !== ctx.account.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "user not authorized to edit this company",
				});
			}

			// verify user is not trying to transfer ownership
			if (input.ownerId !== company.ownerId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "cannot transfer ownership",
				});
			}

			return await CompanyQueryClient.Update(input);
		}),
	deleteCompany: companyOwnerProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			const ownedCompanies = await CompanyQueryClient.GetDetailedManyByOwnerId(
				ctx.account.id,
				false
			);

			if (!ownedCompanies.some((c) => c.id === id)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "user not authorized to delete this company",
				});
			}

			return await CompanyQueryClient.Delete(id);
		}),
	searchCompaniesByKeyword: accountProcedure
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

			return await CompanyQueryClient.GetBasicManyByKeyword(
				keywordQuery,
				cursor,
				pageSize,
				includeDeleted,
				ctx.account.id
			);
		}),
	recommendCompanies: accountProcedure
		.input(
			z.object({
				cursor: z.number().optional().default(1),
				pageSize: z.number().optional().default(10),
				includeDeleted: z.boolean().optional().default(false),
			})
		)
		.query(async ({ ctx, input }) => {
			const { cursor, pageSize, includeDeleted } = input;

			return await CompanyQueryClient.caller.transaction(async (tx) => {
				const companies =
					await CompanyQueryClient.GetBasicManyByUserReccomendation(
						ctx.account.id,
						cursor,
						pageSize,
						includeDeleted
					);

				// Track job recommendation
				if (companies.data.length > 0) {
					await AnalyticQueryClient.withCaller(
						tx
					).TrackAccountCompanyRecommendation(
						companies.data.map((company) => ({
							companyId: company.id,
							accountId: ctx.account.id,
						}))
					);
				}

				return companies;
			});
		}),
	favouriteCompany: accountProcedure
		.input(z.object({ companyId: z.string(), accountId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const cqc = CompanyQueryClient;
			return await cqc.caller.transaction(async (tx) => {
				if (input.accountId !== ctx.account.id) {
					throw new Error("you cannot favourite a job for another account");
				}

				const ownedCompanies = await cqc
					.withCaller(tx)
					.GetDetailedManyByOwnerId(input.accountId);

				if (ownedCompanies.some((company) => company.id === input.companyId)) {
					throw new Error("you cannot favourite a company you own");
				}

				await cqc.withCaller(tx).Favorite(input.accountId, input.companyId);
			});
		}),
	unfavouriteCompany: accountProcedure
		.input(z.object({ companyId: z.string(), accountId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (input.accountId !== ctx.account.id) {
				throw new Error("you cannot unfavourite a job for another account");
			}

			return await CompanyQueryClient.Unfavorite(
				input.accountId,
				input.companyId
			);
		}),
	getIsCompanyFavouritedByAccountId: accountProcedure
		.input(
			z.object({ companyId: z.string().uuid(), accountId: z.string().uuid() })
		)
		.query(async ({ ctx, input }) => {
			if (input.accountId !== ctx.account.id) {
				throw new Error(
					"you cannot check if a job is favourited for another account"
				);
			}

			return await CompanyQueryClient.GetIsCompanyFavouritedByAccountId(
				ctx.account.id,
				input.companyId
			);
		}),

	getFavouritedCompanies: accountProcedure
		.input(
			z.object({
				accountId: z.string().uuid(),
				cursor: z.number().optional().default(1),
				pageSize: z.number().optional().default(10),
				includeDeleted: z.boolean().optional().default(false),
			})
		)
		.query(async ({ ctx, input }) => {
			const { accountId, cursor, pageSize, includeDeleted } = input;

			if (accountId !== ctx.account.id) {
				throw new Error(
					"you cannot check if a job is favourited for another account"
				);
			}

			return await CompanyQueryClient.GetBasicManyFavouritedByAccountId(
				accountId,
				cursor,
				pageSize,
				includeDeleted
			);
		}),
});
