import {
	account_jobs,
	addresses,
	company_jobs,
	jobs,
	companies,
	accounts,
} from "@/lib/db/drizzle/schema";
import { router, accountProcedure } from "../trpc";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { industries, job_industries } from "@/lib/db/drizzle/schema";
import { EditJobSchema, NewJobSchema } from "@/lib/validations/job";
import { and, isNull, inArray, not } from "drizzle-orm";

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

			const [owner_company] = await ctx.db
				.select({
					id: companies.id,
					name: companies.name,
					email_address: companies.email_address,
				}) // Specify the property to select
				.from(company_jobs)
				.where(eq(company_jobs.job_id, res.job.id))
				.innerJoin(companies, eq(company_jobs.company_id, companies.id));

			const [owner_account] = await ctx.db
				.select({
					id: accounts.id,
					username: accounts.username,
				}) // Specify the property to select
				.from(account_jobs)
				.where(eq(account_jobs.job_id, res.job.id))
				.innerJoin(accounts, eq(account_jobs.account_id, accounts.id));

			return {
				...res.job,
				address: res.address,
				industries: jobIndustries.map((industry) => industry.industries),
				company: owner_company,
				account: owner_account,
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
	editJob: accountProcedure
		.input(EditJobSchema)
		.mutation(async ({ ctx, input }) => {
			const { address, industries: inputIndustries, ...job } = input;
			console.log(address, inputIndustries, job);
			try {
			await ctx.db.transaction(async (tx) => {
				const [currAddress] = await tx
					.select()
					.from(addresses)
					.where(eq(addresses.id, job.address_id));

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

					job.address_id = newAddress.id;
				}

				// update the industries, if they already exist, do nothing, otherwise insert them
				await tx
					.insert(job_industries)
					.values(
						inputIndustries.map((industry) => ({
							job_id: job.id!,
							industry_id: industry.id,
						}))
					)
					.onConflictDoNothing();

				await tx
					.delete(job_industries)
					.where(
						and(
							not(inArray(job_industries.industry_id, inputIndustries.map((industry) => industry.id))),
							eq(job_industries.job_id, job.id!)
						)
					);

				await tx.update(jobs).set(job).where(eq(jobs.id, job.id!));
			});
			} catch (e) {
				console.log(e);
				throw e;
			}
		}),
	deleteJob: accountProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id } = input;
			await ctx.db
				.update(jobs)
				.set({ deleted_at: new Date().toISOString() })
				.where(eq(jobs.id, id));
		}),
});
