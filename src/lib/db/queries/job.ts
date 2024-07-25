import QueryClient from ".";
import { and, desc, eq, inArray, isNull, not, sql } from "drizzle-orm";
import { z } from "zod";
import { registerService } from "@/lib/utils";
import { db } from "..";
import { createInsertSchema } from "drizzle-zod";
import {
	accountJobFavourites,
	accountJobs,
	accounts,
	addresses,
	companies,
	companyJobs,
	jobs,
} from "@/lib/db/drizzle/schema";
import { NewAddressSchema } from "./address";
import { ShowIndustrySchema } from "./industry";
import IndustryQueryClient from "./industry";
import AddressQueryClient from "./address";

export type NewJob = z.infer<typeof NewJobSchema>;
export const NewJobSchema = createInsertSchema(jobs, {
	title: z.string().min(3).max(60),
})
	.extend({
		address: NewAddressSchema,
		industries: z
			.string({
				invalid_type_error: "Industries must be an array of strings",
				required_error: "Industries are required",
			})
			.uuid({
				message: "Industries must be valid UUIDs",
			})
			.array(),
		companyId: z.string().uuid().optional(),
		accountId: z.string().uuid().optional(),
	})
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
		isActive: true,
		addressId: true,
		englishSearchVector: true,
	});

export type EditJob = z.infer<typeof EditJobSchema>;
export const EditJobSchema = createInsertSchema(jobs, {
	id: z.string().uuid(),
	title: z.string().min(3).max(60),
})
	.extend({
		address: NewAddressSchema,
		industries: ShowIndustrySchema.array(),
	})
	.omit({
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
		isActive: true,
		englishSearchVector: true,
	});

class JobQueryClient extends QueryClient {
	async GetExtendedById(id: string) {
		const [res] = await this.caller
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

		const industries = await IndustryQueryClient.GetDetailedManyByJobId(id);

		return {
			...res,
			industries,
		};
	}

	async GetDetailedManyOwnedByAccountId(accountId: string) {
		const res = await this.caller
			.select()
			.from(jobs)
			.innerJoin(accountJobs, eq(jobs.id, accountJobs.jobId))
			.where(eq(accountJobs.accountId, accountId));

		return res.map((job) => job.jobs);
	}

	async GetBasicManyByKeyword(
		keyword: string,
		page: number,
		pageSize: number,
		includeDeleted: boolean = false,
		querier: string
	) {
		const querierJobs = await this.GetDetailedManyOwnedByAccountId(querier);

		const res = await this.WithOffsetPagination(
			this.caller
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
								querierJobs.map((job) => job.id)
							)
						),
						includeDeleted ? undefined : isNull(jobs.deletedAt),
						sql`jobs.english_search_vector @@ WEBSEARCH_TO_TSQUERY('english',${keyword})`
					)
				)
				.orderBy(
					sql`ts_rank(jobs.english_search_vector, WEBSEARCH_TO_TSQUERY('english', ${keyword}))`
				)
				.$dynamic(),
			page,
			pageSize
		);

		return this.GenerateOffsetPaginationResponse(res, page, pageSize);
	}

	async GetBasicManyByUserReccomendation(
		userId: string,
		page: number,
		pageSize: number,
		includeDeleted: boolean = false
	) {
		const ownedJobs = await this.GetDetailedManyOwnedByAccountId(userId);
		const ownedJobIds = ownedJobs.map((job) => job.id);

		// TODO: implement recommendation logic
		const res = await this.WithOffsetPagination(
			this.caller
				.select()
				.from(jobs)
				.where(
					and(
						ownedJobs.length > 0
							? not(inArray(jobs.id, ownedJobIds))
							: undefined,
						includeDeleted ? undefined : isNull(jobs.deletedAt)
					)
				)
				.orderBy(desc(jobs.createdAt))
				.$dynamic(),
			page,
			pageSize
		);

		return this.GenerateOffsetPaginationResponse(res, page, pageSize);
	}

	async CreateCompanyJob(values: { companyId: string; jobId: string }) {
		return await this.caller
			.insert(companyJobs)
			.values(values)
			.onConflictDoNothing()
			.returning();
	}

	async CreateAccountJob(values: { accountId: string; jobId: string }) {
		return await this.caller
			.insert(accountJobs)
			.values(values)
			.onConflictDoNothing()
			.returning();
	}

	async Create(values: NewJob) {
		const {
			address,
			industries: industryIds,
			companyId,
			accountId,
			...job
		} = values;

		return await this.caller.transaction(async (tx) => {
			if (!companyId && !accountId) {
				throw new Error("Company or account ID is required");
			}

			const newAddress = await AddressQueryClient.withCaller(tx).Create(
				address
			);

			const [newJob] = await tx
				.insert(jobs)
				.values({
					...job,
					addressId: newAddress.id,
				})
				.returning({ id: jobs.id });

			await IndustryQueryClient.withCaller(tx).CreateJobIndustries(
				industryIds.map((id) => ({
					jobId: newJob.id,
					industryId: id,
				}))
			);

			if (companyId) {
				await this.withCaller(tx).CreateCompanyJob({
					companyId,
					jobId: newJob.id,
				});
			} else if (accountId) {
				await this.withCaller(tx).CreateAccountJob({
					accountId,
					jobId: newJob.id,
				});
			}

			return newJob;
		});
	}

	async Update(values: EditJob) {
		const { address, industries: inputIndustries, id: jobId, ...job } = values;

		if (!jobId) {
			throw new Error("job identifier is required");
		}

		return await this.caller.transaction(async (tx) => {
			const currAddress = await AddressQueryClient.withCaller(
				tx
			).GetDetailedById(job.addressId);

			// if the address values have been changed, update the address
			const addressChanged = Object.entries(address).some(([key, value]) =>
				Object.entries(currAddress).some(([k, v]) => k === key && v !== value)
			);

			if (addressChanged) {
				// Since we're reusing address in other places, we don't wanna update the current address, rather create a new one
				const newAddress = await AddressQueryClient.withCaller(tx).Create(
					address
				);

				job.addressId = newAddress.id;
			}

			// update the industries, if they already exist, do nothing, otherwise insert them
			const newIndustries = await IndustryQueryClient.withCaller(
				tx
			).CreateJobIndustries(
				inputIndustries.map((industry) => ({
					jobId: jobId!,
					industryId: industry.id,
				}))
			);

			const newIndustriesIds = newIndustries.map(
				(industry) => industry.industryId
			);

			const industriesToDelete = inputIndustries.filter(
				(industry) => !newIndustriesIds.includes(industry.id)
			);

			await IndustryQueryClient.withCaller(tx).DeleteJobIndustries(
				jobId,
				industriesToDelete.map((industry) => industry.id)
			);

			return await tx
				.update(jobs)
				.set(job)
				.where(eq(jobs.id, jobId))
				.returning();
		});
	}

	async Delete(id: string) {
		return await this.caller
			.update(jobs)
			.set({ deletedAt: new Date().toISOString() })
			.where(eq(jobs.id, id))
			.returning();
	}

	async Favorite(accountId: string, jobId: string) {
		return await this.caller
			.insert(accountJobFavourites)
			.values({
				accountId,
				jobId,
			})
			.returning();
	}

	async Unfavorite(accountId: string, jobId: string) {
		return await this.caller
			.update(accountJobFavourites)
			.set({
				deletedAt: new Date().toISOString(),
			})
			.where(
				and(
					eq(accountJobFavourites.accountId, accountId),
					eq(accountJobFavourites.jobId, jobId)
				)
			)
			.returning();
	}

	async GetBasicManyByFavouriterAccountId(
		favouriterId: string,
		page: number,
		pageSize: number,
		includeDeleted: boolean = false
	) {
		const res = await this.WithOffsetPagination(
			this.caller
				.select({
					id: jobs.id,
					title: jobs.title,
					deletedAt: jobs.deletedAt,
				})
				.from(jobs)
				.innerJoin(
					accountJobFavourites,
					eq(jobs.id, accountJobFavourites.jobId)
				)
				.where(
					and(
						includeDeleted ? undefined : isNull(jobs.deletedAt),
						eq(accountJobFavourites.accountId, favouriterId)
					)
				)
				.orderBy(desc(accountJobFavourites.createdAt))
				.$dynamic(),
			page,
			pageSize
		);

		return this.GenerateOffsetPaginationResponse(res, page, pageSize);
	}
}

// Create  global service
export default registerService("jobQueryClient", () => new JobQueryClient(db));
