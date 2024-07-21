import QueryClient from ".";
import { eq, and, isNull } from "drizzle-orm";
import { companyIndustries } from "@/lib/db/drizzle/schema";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { industries } from "@/lib/db/drizzle/schema";

type NewIndustry = z.infer<typeof NewIndustrySchema>;
const NewIndustrySchema = createInsertSchema(industries, {
	name: z.string().min(3).max(60),
}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

type ShowIndustry = z.infer<typeof ShowIndustrySchema>;
const ShowIndustrySchema = createSelectSchema(industries);

class IndustryQueryClient extends QueryClient {
	async GetDetailedMany(includeDeleted = false) {
		return await this.caller
			.select()
			.from(industries)
			.where(includeDeleted ? undefined : isNull(industries.deletedAt));
	}

	async GetDetailedManyByCompanyId(companyId: string, includeDeleted = false) {
		const companyIndustriesRes = await this.caller
			.select({ industries })
			.from(companyIndustries)
			.where(eq(companyIndustries.companyId, companyId))
			.innerJoin(
				industries,
				and(
					eq(companyIndustries.industryId, industries.id),
					includeDeleted ? undefined : isNull(industries.deletedAt)
				)
			);

		return companyIndustriesRes.map((industry) => industry.industries);
	}

	async CreateCompanyIndustries(
		values: { companyId: string; industryId: string }[]
	) {
		const newCompanyIndustries = await this.caller
			.insert(companyIndustries)
			.values(values)
			.onConflictDoNothing()
			.returning();

		return newCompanyIndustries;
	}
}

export { NewIndustrySchema, ShowIndustrySchema };
export type { NewIndustry, ShowIndustry };
export default IndustryQueryClient;
