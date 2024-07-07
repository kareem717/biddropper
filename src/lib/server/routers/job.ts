import {
	accountJobs,
	addresses,
	companyJobs,
	jobs,
	companies,
	accounts,
} from "@/lib/db/drizzle/schema";
import { router, accountProcedure } from "../trpc";
import { desc, eq, exists, or, sql } from "drizzle-orm";
import { z } from "zod";
import { industries, jobIndustries } from "@/lib/db/drizzle/schema";
import { EditJobSchema, NewJobSchema } from "@/lib/validations/job";
import { and, isNull, inArray, not } from "drizzle-orm";
import {
	withOffsetPagination,
	generateOffsetPaginationResponse,
	getOwnedJobs,
} from "./shared";

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
					ownerCompany: {
						id: companies.id,
						name: companies.name,
						emailAddress: companies.emailAddress,
					},
					ownerAccount: {
						id: accounts.id,
						username: accounts.username,
					},
				})
				.from(jobs)
				.where(eq(jobs.id, id))
				.innerJoin(addresses, eq(jobs.addressId, addresses.id))
				.leftJoin(companyJobs, eq(jobs.id, companyJobs.jobId))
				.leftJoin(accountJobs, eq(jobs.id, accountJobs.jobId))
				.leftJoin(companies, eq(companyJobs.companyId, companies.id))
				.leftJoin(accounts, eq(accountJobs.accountId, accounts.id));

			const jobIndustriesRes = await ctx.db
				.select({ industries })
				.from(jobIndustries)
				.where(eq(jobIndustries.jobId, id))
				.innerJoin(
					industries,
					and(
						eq(jobIndustries.industryId, industries.id),
						isNull(industries.deletedAt)
					)
				);

			return {
				...res,
				industries: jobIndustriesRes.map((industry) => industry.industries),
			};
		}),
	createJob: accountProcedure
		.input(NewJobSchema)
		.mutation(async ({ ctx, input }) => {
			const {
				address,
				industries: industryIds,
				companyId,
				accountId,
				...job
			} = input;
			const newId = await ctx.db.transaction(async (tx) => {
				if (!companyId && !accountId) {
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
						addressId: newAddress.id,
					})
					.returning({ id: jobs.id });

				const newJobIndustries = industryIds.map((id) => ({
					jobId: newJob.id,
					industryId: id,
				}));

				await tx
					.insert(jobIndustries)
					.values(newJobIndustries)
					.onConflictDoNothing();

				if (companyId) {
					await tx
						.insert(companyJobs)
						.values({
							companyId,
							jobId: newJob.id,
						})
						.onConflictDoNothing();
				} else if (accountId) {
					await tx
						.insert(accountJobs)
						.values({
							accountId,
							jobId: newJob.id,
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
			const { address, industries: inputIndustries, id: jobId, ...job } = input;
			console.log(address, inputIndustries, job);
			try {
				await ctx.db.transaction(async (tx) => {
					const [currAddress] = await tx
						.select()
						.from(addresses)
						.where(eq(addresses.id, job.addressId));

					// if the address values have been changed, update the address
					const addressChanged = Object.entries(address).some(([key, value]) =>
						Object.entries(currAddress).some(
							([k, v]) => k === key && v !== value
						)
					);

					if (addressChanged) {
						// Since we're reusing address in other places, we don't wanna update the current address, rather create a new one
						const [newAddress] = await tx
							.insert(addresses)
							.values(address)
							.returning({ id: addresses.id });

						job.addressId = newAddress.id;
					}

					// update the industries, if they already exist, do nothing, otherwise insert them
					await tx
						.insert(jobIndustries)
						.values(
							inputIndustries.map((industry) => ({
								jobId: jobId!,
								industryId: industry.id,
							}))
						)
						.onConflictDoNothing();

					await tx.delete(jobIndustries).where(
						and(
							not(
								inArray(
									jobIndustries.industryId,
									inputIndustries.map((industry) => industry.id)
								)
							),
							eq(jobIndustries.jobId, jobId!)
						)
					);

					await tx.update(jobs).set(job).where(eq(jobs.id, jobId!));
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
				.set({ deletedAt: new Date().toISOString() })
				.where(eq(jobs.id, id));
		}),
	searchJobsByKeyword: accountProcedure
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

			const ownedJobs = await getOwnedJobs(ctx, ctx.db, ctx.account.id);

			const res = await withOffsetPagination(
				ctx.db
					.select({
						id: jobs.id,
						title: jobs.title,
						deletedAt: jobs.deletedAt,
					})
					.from(jobs)
					.where(
						and(
							not(
								inArray(
									jobs.id,
									ownedJobs.map((job) => job.id)
								)
							),
							includeDeleted ? undefined : isNull(jobs.deletedAt),
							sql`jobs.english_search_vector @@ WEBSEARCH_TO_TSQUERY('english',${keywordQuery})`
						)
					)
					.orderBy(
						sql`ts_rank(jobs.english_search_vector, WEBSEARCH_TO_TSQUERY('english', ${keywordQuery}))`
					)
					.$dynamic(),
				cursor,
				pageSize
			);

			return generateOffsetPaginationResponse(res, cursor, pageSize);
		}),
	recommendJobs: accountProcedure
		.input(
			z.object({
				cursor: z.number().optional().default(1),
				pageSize: z.number().optional().default(10),
				includeDeleted: z.boolean().optional().default(false),
			})
		)
		.query(async ({ ctx, input }) => {
			// TODO: Need to track recommendations per account/company and then which ones they acctually view/bid on
			const { cursor, pageSize, includeDeleted } = input;

			const ownedJobs = await getOwnedJobs(ctx, ctx.db, ctx.account.id);

			// TODO: implement recommendation logic
			const res = await withOffsetPagination(
				ctx.db
					.select()
					.from(jobs)
					.where(
						and(
							not(
								inArray(
									jobs.id,
									ownedJobs.map((job) => job.id)
								)
							),
							not(
								inArray(
									jobs.id,
									ownedJobs.map((job) => job.id)
								)
							),
							includeDeleted ? undefined : isNull(jobs.deletedAt)
						)
					)
					.orderBy(desc(jobs.createdAt))
					.$dynamic(),
				cursor,
				pageSize
			);

			return generateOffsetPaginationResponse(res, cursor, pageSize);
		}),
});
