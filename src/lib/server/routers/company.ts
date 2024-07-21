import { router, accountProcedure, companyOwnerProcedure } from "../trpc";
import { EditCompanySchema, NewCompanySchema } from "@/lib/db/queries/company";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import CompanyQueryClient from "@/lib/db/queries/company";

export const companyRouter = router({
	getOwnedCompanies: accountProcedure
		.input(
			z.object({
				includeDeleted: z.boolean().optional().default(false),
			})
		)
		.query(async ({ ctx, input }) => {
			const companyQueryClient = new CompanyQueryClient(ctx.db);
			return await companyQueryClient.GetDetailedManyByOwnerId(
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
			const { id } = input;

			const companyQueryClient = new CompanyQueryClient(ctx.db);
			return await companyQueryClient.GetDetailedById(id);
		}),
	getCompanyFull: accountProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { id } = input;
			const companyQueryClient = new CompanyQueryClient(ctx.db);
			return await companyQueryClient.GetExtendedById(id);
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

			const companyQueryClient = new CompanyQueryClient(ctx.db);
			return await companyQueryClient.Create(input);
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

			const companyQueryClient = new CompanyQueryClient(ctx.db);

			const company = await companyQueryClient.GetDetailedById(input.id);

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

			return await companyQueryClient.Update(input);
		}),
	deleteCompany: companyOwnerProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id } = input;
			const companyQueryClient = new CompanyQueryClient(ctx.db);

			const ownedCompanies = await companyQueryClient.GetDetailedManyByOwnerId(
				ctx.account.id,
				false
			);

			if (!ownedCompanies.some((c) => c.id === id)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "user not authorized to delete this company",
				});
			}

			return await companyQueryClient.Delete(id);
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
			const companyQueryClient = new CompanyQueryClient(ctx.db);

			return await companyQueryClient.GetBasicManyByKeyword(
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
			// TODO: Need to track recommendations per account/company and then which ones they acctually view/select
			const { cursor, pageSize, includeDeleted } = input;
			const companyQueryClient = new CompanyQueryClient(ctx.db);

			return await companyQueryClient.GetBasicManyByUserReccomendation(
				ctx.account.id,
				cursor,
				pageSize,
				includeDeleted
			);
		}),
});
