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
			try {
				if (input.includeDeleted) {
					return ctx.ownedCompanies;
				}

				return ctx.ownedCompanies?.filter(
					(company) => company.deletedAt === null
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while fetching owned companies",
					cause: error,
				});
			}
		}),
	getCompanyFull: accountProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			try {
				return await CompanyQueryClient.GetExtendedById(input.id);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while fetching the company",
					cause: error,
				});
			}
		}),

	createCompany: accountProcedure
		.input(NewCompanySchema)
		.mutation(async ({ ctx, input }) => {
			if (input.industries.length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You must select at least one industry",
				});
			}

			if (input.ownerId !== ctx.account.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You must be the owner of the company",
				});
			}

			try {
				return await CompanyQueryClient.Create(input);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while creating the company",
					cause: error,
				});
			}
		}),
	editCompany: companyOwnerProcedure
		.input(EditCompanySchema)
		.mutation(async ({ ctx, input }) => {
			if (!input.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Company ID is required",
				});
			}

			let company;
			try {
				company = await CompanyQueryClient.GetDetailedById(input.id);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while fetching the company",
					cause: error,
				});
			}

			if (!company) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Company not found",
				});
			}

			// verify user owns company
			if (company.ownerId !== ctx.account.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to edit this company",
				});
			}

			// verify user is not trying to transfer ownership
			if (input.ownerId !== company.ownerId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You cannot transfer ownership of a company",
				});
			}

			try {
				return await CompanyQueryClient.Update(input);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while editing the company",
					cause: error,
				});
			}
		}),
	deleteCompany: companyOwnerProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			if (!ctx.ownedCompanies.some((c) => c.id === id)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to delete this company",
				});
			}

			try {
				return await CompanyQueryClient.Delete(id);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while deleting the company",
					cause: error,
				});
			}
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

			try {
				return await CompanyQueryClient.GetBasicManyByKeyword(
					keywordQuery,
					cursor,
					pageSize,
					includeDeleted,
					ctx.account.id
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while searching companies",
					cause: error,
				});
			}
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
				let companies;
				try {
					companies = await CompanyQueryClient.GetBasicManyByUserReccomendation(
						ctx.account.id,
						cursor,
						pageSize,
						includeDeleted
					);
				} catch (error) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "An error occurred while recommending companies",
						cause: error,
					});
				}

				try {
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
				} catch (error) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "An error occurred while tracking company recommendation",
						cause: error,
					});
				}

				return companies;
			});
		}),
	favouriteCompany: accountProcedure
		.input(z.object({ companyId: z.string(), accountId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const cqc = CompanyQueryClient;

			if (input.accountId !== ctx.account.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You cannot favourite a company for another account",
				});
			}

			if (
				ctx.ownedCompanies?.some((company) => company.id === input.companyId)
			) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You cannot favourite a company you own",
				});
			}

			try {
				return await cqc.caller.transaction(async (tx) => {
					await cqc.withCaller(tx).Favorite(input.accountId, input.companyId);
				});
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while favouriting the company",
					cause: error,
				});
			}
		}),
	unfavouriteCompany: accountProcedure
		.input(z.object({ companyId: z.string(), accountId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (input.accountId !== ctx.account.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You cannot unfavourite a company for another account",
				});
			}

			try {
				return await CompanyQueryClient.Unfavorite(
					input.accountId,
					input.companyId
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while unfavouriting the company",
					cause: error,
				});
			}
		}),
	getIsCompanyFavouritedByAccountId: accountProcedure
		.input(
			z.object({ companyId: z.string().uuid(), accountId: z.string().uuid() })
		)
		.query(async ({ ctx, input }) => {
			if (input.accountId !== ctx.account.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"You cannot check if a company is favourited for another account",
				});
			}

			try {
				return await CompanyQueryClient.GetIsCompanyFavouritedByAccountId(
					ctx.account.id,
					input.companyId
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						"An error occurred while checking if the company is favourited",
					cause: error,
				});
			}
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
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"You cannot check if a company is favourited for another account",
				});
			}

			try {
				return await CompanyQueryClient.GetBasicManyFavouritedByAccountId(
					accountId,
					cursor,
					pageSize,
					includeDeleted
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while fetching favourited companies",
					cause: error,
				});
			}
		}),
});
