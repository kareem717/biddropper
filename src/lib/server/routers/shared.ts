import { Context } from "@/lib/trpc/context";
import { accountJobs, companyJobs, jobs } from "@/lib/db/drizzle/schema";
import { and, eq, exists, inArray, or } from "drizzle-orm";
import { DB } from "@/lib/db";

export const getOwnedJobs = async (ctx: Context, db: DB, accountId: string) => {
	const ownedCompanyIds =
		ctx.ownedCompanies?.map((company) => company.id) || [];

	return await db
		.select({ id: jobs.id })
		.from(jobs)
		.where(
			or(
				exists(
					db
						.select()
						.from(companyJobs)
						.where(
							and(
								eq(companyJobs.jobId, jobs.id),
								inArray(companyJobs.companyId, ownedCompanyIds)
							)
						)
				),
				exists(
					db
						.select()
						.from(accountJobs)
						.where(
							and(
								eq(accountJobs.jobId, jobs.id),
								eq(accountJobs.accountId, accountId)
							)
						)
				)
			)
		);
};
