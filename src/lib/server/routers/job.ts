import {
	account_jobs,
	addresses,
	company_jobs,
	jobs,
} from "@/lib/db/drizzle/schema";
import { router, accountProcedure } from "../trpc";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { industries, job_industries } from "@/lib/db/drizzle/schema";
import { NewJobSchema } from "@/lib/validations/job";
import { and, isNull } from "drizzle-orm";

export const jobRouter = router({
	getJobFull: accountProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { id } = input;
			const [res] = await ctx.db
				.select({
					job: jobs,
					address: addresses,
				})
				.from(jobs)
				.where(eq(jobs.id, id))
				.innerJoin(addresses, eq(jobs.address_id, addresses.id));

			const jobIndustries = await ctx.db
				.select({ industries })
				.from(job_industries)
				.where(eq(job_industries.job_id, id))
				.innerJoin(
					industries,
					and(
						eq(job_industries.industry_id, industries.id),
						isNull(industries.deleted_at)
					)
				);

			const owner_company = await ctx.db
				.select({ company_id: company_jobs.company_id }) // Specify the property to select
				.from(company_jobs)
				.where(eq(company_jobs.job_id, res.job.id));

			const owner_account = await ctx.db
				.select({ account_id: account_jobs.account_id }) // Specify the property to select
				.from(account_jobs)
				.where(eq(account_jobs.job_id, res.job.id));

			return {
				...res.job,
				address: res.address,
				industries: jobIndustries,
				company_id: owner_company,
				account_id: owner_account,
			};
		}),

	createJob: accountProcedure
		.input(NewJobSchema)
		.mutation(async ({ ctx, input }) => {
			const {
				address,
				industries: industryIds,
				company_id,
				account_id,
				...job
			} = input;
			const newId = await ctx.db.transaction(async (tx) => {
				if (!company_id && !account_id) {
					throw new Error("Company or account ID is required");
				}

				const [newAddress] = await tx
					.insert(addresses)
					.values(address)
					.returning({ id: addresses.id });

				const [newJob] = await tx
					.insert(jobs)
					.values({
						...job,
						address_id: newAddress.id,
					})
					.returning({ id: jobs.id });

				const newJobIndustries = industryIds.map((id) => ({
					job_id: newJob.id,
					industry_id: id,
				}));

				await tx
					.insert(job_industries)
					.values(newJobIndustries)
					.onConflictDoNothing();

				if (company_id) {
					await tx
						.insert(company_jobs)
						.values({
							company_id,
							job_id: newJob.id,
						})
						.onConflictDoNothing();
				} else if (account_id) {
					await tx
						.insert(account_jobs)
						.values({
							account_id,
							job_id: newJob.id,
						})
						.onConflictDoNothing();
				}

				return newJob.id;
			});

			return newId;
		}),
});
