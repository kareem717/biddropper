import {
	addresses,
	companies,
	company_industries,
} from "@/lib/db/drizzle/schema";
import { router, accountProcedure } from "../trpc";
import { NewCompanySchema } from "@/lib/validations/company";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { industries } from "@/lib/db/drizzle/schema";

export const companyRouter = router({
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
					eq(company_industries.industry_id, industries.id)
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
});
