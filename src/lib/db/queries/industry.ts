import QueryClient from ".";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { companyIndustries, jobIndustries } from "@/lib/db/drizzle/schema";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { industries } from "@/lib/db/drizzle/schema";
import { registerService } from "@/lib/utils";
import { db } from "..";

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

	async GetDetailedManyByJobId(jobId: string, includeDeleted = false) {
		const jobIndustriesRes = await this.caller
			.select({ industries })
			.from(jobIndustries)
			.where(eq(jobIndustries.jobId, jobId))
			.innerJoin(
				industries,
				and(
					eq(jobIndustries.industryId, industries.id),
					includeDeleted ? undefined : isNull(industries.deletedAt)
				)
			);

		return jobIndustriesRes.map((industry) => industry.industries);
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

	async CreateJobIndustries(values: { jobId: string; industryId: string }[]) {
		const newJobIndustries = await this.caller
			.insert(jobIndustries)
			.values(values)
			.onConflictDoNothing()
			.returning();

		return newJobIndustries;
	}

	async DeleteJobIndustries(jobId: string, industryIds: string[]) {
		await this.caller
			.delete(jobIndustries)
			.where(
				and(
					eq(jobIndustries.jobId, jobId),
					inArray(jobIndustries.industryId, industryIds)
				)
			);
	}

	async DeleteCompanyIndustries(companyId: string, industryIds: string[]) {
		await this.caller
			.delete(companyIndustries)
			.where(
				and(
					eq(companyIndustries.companyId, companyId),
					inArray(companyIndustries.industryId, industryIds)
				)
			);
	}
}

// Create global service
export default registerService(
	"industryQueryClient",
	() => new IndustryQueryClient(db)
);
