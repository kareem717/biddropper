import {
	addresses,
	companies,
	company_industries,
} from "@/lib/db/drizzle/schema";
import { router, accountProcedure, companyOwnerProcedure } from "../trpc";
import { EditCompanySchema, NewCompanySchema } from "@/lib/validations/company";
import { eq, and, isNull, inArray, not } from "drizzle-orm";
import { z } from "zod";
import { industries } from "@/lib/db/drizzle/schema";

export const companyRouter = router({
	getOwnedCompanies: accountProcedure.query(async ({ ctx }) => {
		return ctx.ownedCompanies;
	}),
	getCompanyById: accountProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { id } = input;
			const [res] = await ctx.db
				.select()
				.from(companies)
				.where(eq(companies.id, id));
			return res;
		}),
	getCompanyFull: accountProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { id } = input;
			const company = await ctx.db
				.select({
					company: companies,
					address: addresses,
				})
				.from(companies)
				.where(eq(companies.id, id))
				.innerJoin(addresses, eq(companies.address_id, addresses.id));

			const companyIndustries = await ctx.db
				.select({ industries })
				.from(company_industries)
				.where(eq(company_industries.company_id, id))
				.innerJoin(
					industries,
					and(
						eq(company_industries.industry_id, industries.id),
						isNull(industries.deleted_at)
					)
				);

			return {
				...company,
				industries: companyIndustries,
			};
		}),

	createCompany: accountProcedure
		.input(NewCompanySchema)
		.mutation(async ({ ctx, input }) => {
			const { address, industries, ...company } = input;
			const newId = await ctx.db.transaction(async (tx) => {
				const [newAddress] = await tx
					.insert(addresses)
					.values(address)
					.returning({ id: addresses.id });

				const [newCompany] = await tx
					.insert(companies)
					.values({
						...company,
						address_id: newAddress.id,
						owner_id: ctx.account.id,
					})
					.returning({ id: companies.id });

				const newCompanyIndustries = industries.map((industry) => ({
					company_id: newCompany.id,
					industry_id: industry,
				}));
				await tx
					.insert(company_industries)
					.values(newCompanyIndustries)
					.onConflictDoNothing();

				return newCompany.id;
			});

			return newId;
		}),
	editCompany: companyOwnerProcedure
		.input(EditCompanySchema)
		.mutation(async ({ ctx, input }) => {
			const { address, industries, ...company } = input;
			await ctx.db.transaction(async (tx) => {
				const [currAddress] = await tx
					.select()
					.from(addresses)
					.where(eq(addresses.id, company.address_id));

				// if the address values have been changed, update the address
				const addressChanged = Object.entries(address).some(([key, value]) =>
					Object.entries(currAddress).some(([k, v]) => k === key && v !== value)
				);

				if (addressChanged) {
					// Since we're reusing address in other places, we don't wanna update the current address, rather create a new one
					const [newAddress] = await tx
						.insert(addresses)
						.values(address)
						.returning({ id: addresses.id });

					company.address_id = newAddress.id;
				}

				// update the industries, if they already exist, do nothing, otherwise insert them
				await tx
					.insert(company_industries)
					.values(
						industries.map((id) => ({
							company_id: company.id!,
							industry_id: id,
						}))
					)
					.onConflictDoNothing();

				await tx
					.delete(company_industries)
					.where(
						and(
							not(inArray(company_industries.industry_id, industries)),
							eq(company_industries.company_id, company.id!)
						)
					);

				await tx.insert(companies).values({
					...company,
				});
			});
		}),
	deleteCompany: companyOwnerProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id } = input;
			await ctx.db
				.update(companies)
				.set({ deleted_at: new Date().toISOString() })
				.where(eq(companies.id, id));
		}),
});
