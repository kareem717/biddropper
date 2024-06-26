import {
	addresses,
	companies,
	companyIndustries,
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
			const [company] = await ctx.db
				.select({
					company: companies,
					address: addresses,
				})
				.from(companies)
				.where(eq(companies.id, id))
				.innerJoin(addresses, eq(companies.addressId, addresses.id));

			const companyIndustriesRes = await ctx.db
				.select({ industries })
				.from(companyIndustries)
				.where(eq(companyIndustries.companyId, id))
				.innerJoin(
					industries,
					and(
						eq(companyIndustries.industryId, industries.id),
						isNull(industries.deletedAt)
					)
				);

			return {
				...company.company,
				address: company.address,
				industries: companyIndustriesRes.map((industry) => industry.industries),
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
						addressId: newAddress.id,
						ownerId: ctx.account.id,
					})
					.returning({ id: companies.id });

				const newCompanyIndustries = industries.map((industry) => ({
					companyId: newCompany.id,
					industryId: industry,
				}));
				await tx
					.insert(companyIndustries)
					.values(newCompanyIndustries)
					.onConflictDoNothing();

				return newCompany.id;
			});

			return newId;
		}),
	editCompany: companyOwnerProcedure
		.input(EditCompanySchema)
		.mutation(async ({ ctx, input }) => {
			const { address, industries, id: companyId, ...company } = input;
			await ctx.db.transaction(async (tx) => {
				const [currAddress] = await tx
					.select()
					.from(addresses)
					.where(eq(addresses.id, company.addressId));

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

					company.addressId = newAddress.id;
				}

				// update the industries, if they already exist, do nothing, otherwise insert them
				await tx
					.insert(companyIndustries)
					.values(
						industries.map((industry) => ({
							companyId: companyId!,
							industryId: industry.id,
						}))
					)
					.onConflictDoNothing();

				await tx.delete(companyIndustries).where(
					and(
						not(
							inArray(
								companyIndustries.industryId,
								industries.map((industry) => industry.id)
							)
						),
						eq(companyIndustries.companyId, companyId!)
					)
				);

				await tx
					.update(companies)
					.set(company)
					.where(eq(companies.id, companyId!));
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
				.set({ deletedAt: new Date().toISOString() })
				.where(eq(companies.id, id));
		}),
});
