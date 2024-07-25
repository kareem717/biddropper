import QueryClient, { OffsetPaginationOptions } from ".";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { registerService } from "@/lib/utils";
import { db } from "..";
import { bidStatus, bids } from "@/lib/db/drizzle/schema";
import {
	accountJobs,
	companyJobs,
	jobBids,
	jobs,
	companies,
	accounts,
} from "@/lib/db/drizzle/schema";
import { eq, and, isNull, inArray, lte, gte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import CompanyQueryClient from "./company";
import MessageQueryClient from "./message";

export type NewBid = z.infer<typeof NewBidSchema>;
export const NewBidSchema = createInsertSchema(bids, {
	priceUsd: z.coerce.number().min(0).max(25000000),
})
	.extend({
		jobId: z.string().uuid(),
	})
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
		isActive: true,
	});

export type EditBid = z.infer<typeof EditBidSchema>;
export const EditBidSchema = createInsertSchema(bids, {
	priceUsd: z.coerce.number().min(0).max(25000000),
}).omit({
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	isActive: true,
});

export type ShowBid = z.infer<typeof ShowBidSchema>;
export const ShowBidSchema = z.object({
	bids: createSelectSchema(bids),
	job: z.object({
		id: z.string().uuid(),
		title: z.string(),
		description: z.string(),
		createdAt: z.string(),
		deletedAt: z.string().nullable(),
	}),
});

export type DetailedBid = z.infer<typeof DetailedBidSchema>;
export const DetailedBidSchema = ShowBidSchema.extend({
	senderCompany: z.object({
		id: z.string().uuid(),
		name: z.string(),
		ownerAccountId: z.string().uuid(),
	}),
	job: z.object({
		id: z.string().uuid(),
		title: z.string(),
		owner: z.union([
			z.object({
				companyId: z.string().uuid(),
				companyName: z.string(),
				ownerAccountId: z.string().uuid(),
			}),
			z.object({
				accountId: z.string().uuid(),
				accountUsername: z.string(),
			}),
		]),
	}),
});

export type BidFilter = z.infer<typeof BidFilterSchema>;
export const BidFilterSchema = z.object({
	statuses: z
		.array(z.enum(bidStatus.enumValues))
		.optional()
		.default([bidStatus.enumValues[0]]), // default to pending
	jobIdFilter: z.string().uuid().optional(),
	senderCompanyIdFilter: z.string().uuid().optional(),
	includeDeleted: z.boolean().optional().default(false),
	minPriceUsd: z.coerce.number().optional(),
	maxPriceUsd: z.coerce.number().optional(),
});

class BidsQueryClient extends QueryClient {
	async GetExtendedManyById(ids: string[]) {
		const senderCompany = alias(companies, "senderCompany");
		const ownerCompany = alias(companies, "ownerCompany");

		const res = await this.caller
			.select({
				bids,
				senderCompany: {
					id: senderCompany.id,
					ownerAccountId: senderCompany.ownerId,
					name: senderCompany.name,
				},
				job: {
					id: jobBids.jobId,
					title: jobs.title,
					description: jobs.description,
					createdAt: jobs.createdAt,
					deletedAt: jobs.deletedAt,
					jobOwnerAccountId: accountJobs.accountId,
					jobOwnerAccountUsername: accounts.username,
					jobOwnerCompanyId: ownerCompany.id,
					jobOwnerCompanyName: ownerCompany.name,
					jobOwnerCompanyOwnerAccountId: ownerCompany.ownerId,
				},
			})
			.from(bids)
			.innerJoin(jobBids, eq(bids.id, jobBids.bidId))
			.innerJoin(jobs, eq(jobBids.jobId, jobs.id))
			.leftJoin(accountJobs, eq(jobBids.jobId, accountJobs.jobId))
			.leftJoin(accounts, eq(accountJobs.accountId, accounts.id))
			.leftJoin(companyJobs, eq(jobBids.jobId, companyJobs.jobId))
			.leftJoin(ownerCompany, eq(companyJobs.companyId, ownerCompany.id))
			.innerJoin(senderCompany, eq(bids.senderCompanyId, senderCompany.id))
			.where(and(inArray(bids.id, ids), isNull(bids.deletedAt)));

		return res.map((r) => ({
			bids: r.bids,
			senderCompany: r.senderCompany,
			job: {
				...r.job,
				owner: r.job.jobOwnerAccountId
					? {
							accountId: r.job.jobOwnerAccountId!,
							accountUsername: r.job.jobOwnerAccountUsername!,
					  }
					: {
							companyId: r.job.jobOwnerCompanyId!,
							companyName: r.job.jobOwnerCompanyName!,
							ownerAccountId: r.job.jobOwnerCompanyOwnerAccountId!,
					  },
			},
		}));
	}

	async GetExtendedManySentByCompanyId(
		filter: BidFilter,
		pagination: OffsetPaginationOptions,
		companyId: string
	) {
		const { page, pageSize } = pagination;
		const {
			statuses,
			jobIdFilter,
			senderCompanyIdFilter,
			includeDeleted,
			minPriceUsd,
			maxPriceUsd,
		} = filter;

		const res = await this.WithOffsetPagination(
			this.caller
				.select({
					bids,
					job: {
						id: jobs.id,
						title: jobs.title,
						description: jobs.description,
						createdAt: jobs.createdAt,
						deletedAt: jobs.deletedAt,
					},
				})
				.from(bids)
				.innerJoin(jobBids, and(eq(bids.id, jobBids.bidId)))
				.innerJoin(jobs, eq(jobBids.jobId, jobs.id))
				.where(
					and(
						eq(bids.senderCompanyId, companyId),
						inArray(bids.status, statuses),
						senderCompanyIdFilter
							? eq(bids.senderCompanyId, senderCompanyIdFilter)
							: undefined,
						jobIdFilter ? eq(jobBids.jobId, jobIdFilter) : undefined,
						includeDeleted ? undefined : isNull(bids.deletedAt),
						minPriceUsd
							? gte(bids.priceUsd, minPriceUsd.toString())
							: undefined,
						maxPriceUsd ? lte(bids.priceUsd, maxPriceUsd.toString()) : undefined
					)
				)
				.$dynamic(),
			page,
			pageSize
		);

		return this.GenerateOffsetPaginationResponse(res, page, pageSize);
	}

	async GetExtendedManyReceivedByCompanyId(
		filter: BidFilter,
		pagination: OffsetPaginationOptions,
		companyId: string
	) {
		const { page, pageSize } = pagination;
		const {
			statuses,
			jobIdFilter,
			senderCompanyIdFilter,
			includeDeleted,
			minPriceUsd,
			maxPriceUsd,
		} = filter;

		const res = await this.WithOffsetPagination(
			this.caller
				.select({
					bids,
					job: {
						id: jobs.id,
						title: jobs.title,
						description: jobs.description,
						createdAt: jobs.createdAt,
						deletedAt: jobs.deletedAt,
					},
				})
				.from(bids)
				.innerJoin(companyJobs, eq(companyJobs.companyId, companyId))
				.innerJoin(jobs, eq(companyJobs.jobId, jobs.id))
				.innerJoin(
					jobBids,
					and(eq(companyJobs.companyId, companyId), eq(bids.id, jobBids.bidId))
				)
				.where(
					and(
						eq(bids.senderCompanyId, companyId),
						inArray(bids.status, statuses),
						senderCompanyIdFilter
							? eq(bids.senderCompanyId, senderCompanyIdFilter)
							: undefined,
						jobIdFilter ? eq(jobBids.jobId, jobIdFilter) : undefined,
						includeDeleted ? undefined : isNull(bids.deletedAt),
						minPriceUsd
							? gte(bids.priceUsd, minPriceUsd.toString())
							: undefined,
						maxPriceUsd ? lte(bids.priceUsd, maxPriceUsd.toString()) : undefined
					)
				)
				.$dynamic(),
			page,
			pageSize
		);

		return this.GenerateOffsetPaginationResponse(res, page, pageSize);
	}

	async GetExtendedManyReceivedByAccountId(
		filter: BidFilter,
		pagination: OffsetPaginationOptions,
		accountId: string
	) {
		const { page, pageSize } = pagination;
		const {
			statuses,
			jobIdFilter,
			senderCompanyIdFilter,
			includeDeleted,
			minPriceUsd,
			maxPriceUsd,
		} = filter;

		const res = await this.WithOffsetPagination(
			this.caller
				.select({
					bids,
					job: {
						id: jobs.id,
						title: jobs.title,
						description: jobs.description,
						createdAt: jobs.createdAt,
						deletedAt: jobs.deletedAt,
					},
				})
				.from(bids)
				.innerJoin(accountJobs, eq(accountJobs.accountId, accountId))
				.innerJoin(jobs, eq(accountJobs.jobId, jobs.id))
				.innerJoin(
					jobBids,
					and(eq(accountJobs.accountId, accountId), eq(bids.id, jobBids.bidId))
				)
				.where(
					and(
						inArray(bids.status, statuses),
						senderCompanyIdFilter
							? eq(bids.senderCompanyId, senderCompanyIdFilter)
							: undefined,
						jobIdFilter ? eq(jobBids.jobId, jobIdFilter) : undefined,
						includeDeleted ? undefined : isNull(bids.deletedAt),
						minPriceUsd
							? gte(bids.priceUsd, minPriceUsd.toString())
							: undefined,
						maxPriceUsd ? lte(bids.priceUsd, maxPriceUsd.toString()) : undefined
					)
				)
				.$dynamic(),
			page,
			pageSize
		);

		return this.GenerateOffsetPaginationResponse(res, page, pageSize);
	}

	async GetExtendedManyReceivedByJobId(
		filter: BidFilter,
		pagination: OffsetPaginationOptions,
		jobId: string
	) {
		const { page, pageSize } = pagination;
		const {
			statuses,
			jobIdFilter,
			senderCompanyIdFilter,
			includeDeleted,
			minPriceUsd,
			maxPriceUsd,
		} = filter;

		const res = await this.WithOffsetPagination(
			this.caller
				.select({
					bids,
					job: {
						id: jobs.id,
						title: jobs.title,
						description: jobs.description,
						createdAt: jobs.createdAt,
						deletedAt: jobs.deletedAt,
					},
				})
				.from(bids)
				.innerJoin(jobs, eq(jobBids.jobId, jobs.id))
				.innerJoin(
					jobBids,
					and(eq(jobBids.jobId, jobId), eq(bids.id, jobBids.bidId))
				)
				.where(
					and(
						inArray(bids.status, statuses),
						senderCompanyIdFilter
							? eq(bids.senderCompanyId, senderCompanyIdFilter)
							: undefined,
						jobIdFilter ? eq(jobBids.jobId, jobIdFilter) : undefined,
						includeDeleted ? undefined : isNull(bids.deletedAt),
						minPriceUsd
							? gte(bids.priceUsd, minPriceUsd.toString())
							: undefined,
						maxPriceUsd ? lte(bids.priceUsd, maxPriceUsd.toString()) : undefined
					)
				)
				.$dynamic(),
			page,
			pageSize
		);

		return this.GenerateOffsetPaginationResponse(res, page, pageSize);
	}

	async GetHottestManyByAccountId(accountId: string) {
		//TODO: implement properly
		const bidIds = await this.caller
			.select({
				id: bids.id,
			})
			.from(bids)
			.innerJoin(jobBids, eq(bids.id, jobBids.bidId));

		if (!bidIds.length) {
			return [];
		}

		return await this.GetExtendedManyById(bidIds.map((b) => b.id));
	}

	async Create(values: NewBid, querierAccountId: string) {
		//TODO: This query is doing too much. It should be split into smaller queries
		const { jobId, ...bid } = values;

		const newId = await this.caller.transaction(async (tx) => {
			// Fetch job for verification
			const [job] = await tx
				.select({
					title: jobs.title,
					ownerAccountId: accountJobs.accountId,
					ownerCompany: {
						id: companies.id,
						ownerAccountId: companies.ownerId,
					},
				})
				.from(jobs)
				.leftJoin(accountJobs, eq(jobs.id, accountJobs.jobId))
				.leftJoin(companyJobs, eq(jobs.id, companyJobs.jobId))
				.leftJoin(companies, eq(companyJobs.companyId, companies.id))
				.where(eq(jobs.id, jobId));

			// Verify that the bid is NOT for a job owned by the current account or one of their companies
			if (
				job.ownerAccountId === querierAccountId ||
				job.ownerCompany?.ownerAccountId === querierAccountId
			) {
				throw new Error("cannot bid on your own job");
			}

			const ownedCompanies = await CompanyQueryClient.withCaller(
				tx
			).GetDetailedManyByOwnerId(querierAccountId);

			// Verify that the bid is for a company owned by the current account
			if (
				job.ownerCompany?.id &&
				!ownedCompanies.map((c) => c.id).includes(job.ownerCompany.id)
			) {
				throw new Error("you are not the owner of the bidding company");
			}

			const [newbid] = await tx
				.insert(bids)
				.values({
					...bid,
					priceUsd: bid.priceUsd.toString(),
				})
				.returning({ id: bids.id });

			await tx.insert(jobBids).values({
				jobId,
				bidId: newbid.id,
			});

			let accountId = job.ownerCompany?.ownerAccountId || job.ownerAccountId;

			if (!accountId) {
				throw new Error("account id not found");
			}

			await MessageQueryClient.withCaller(tx).Create({
				senderAccountId: accountId,
				recipients: {
					accountIds: [accountId],
					companyIds: [],
				},
				title: "New bid",
				description: `You have received a new bid for ${job.title}`,
			});

			return newbid.id;
		});

		return newId;
	}

	async Update(values: EditBid, querierAccountId: string) {
		const { id: bidId, ...bid } = values;

		// Fetch bid for verification
		const [bidRes] = await this.caller
			.select({
				bids,
				company: {
					id: companies.id,
					ownerAccountId: companies.ownerId,
				},
			})
			.from(bids)
			.innerJoin(companies, eq(bids.senderCompanyId, companies.id))
			.where(and(eq(bids.id, bidId!), isNull(bids.deletedAt)));

		if (!bid) {
			throw new Error("bid not found");
		}

		const ownedCompanies = await CompanyQueryClient.withCaller(
			this.caller
		).GetDetailedManyByOwnerId(querierAccountId);

		// Verify that the bid is from a company owned by the current account
		if (ownedCompanies.map((c) => c.id).includes(bidRes.company.id || "")) {
			throw new Error("you are not the owner of the company who sent the bid");
		}

		if (bidRes.bids.status !== bidStatus.enumValues[0]) {
			throw new Error("bid is not pending");
		}

		const res = await this.caller
			.update(bids)
			.set({
				...bid,
				priceUsd: bid.priceUsd.toString(),
			})
			.where(eq(bids.id, bidId!))
			.returning();

		return res;
	}

	async UpdateStatusMany(
		ids: string[],
		status: (typeof bidStatus.enumValues)[number],
		overrideNonPending: boolean = false
	) {
		return await this.caller
			.update(bids)
			.set({ status })
			.where(
				and(
					inArray(bids.id, ids),
					overrideNonPending
						? undefined
						: eq(bids.status, bidStatus.enumValues[0])
				)
			)
			.returning();
	}

	async RejectMany(ids: string[], querierAccountId: string) {
		const bids = await this.GetExtendedManyById(ids);
		const ownedCompanyIds = new Set(
			(await CompanyQueryClient.GetDetailedManyByOwnerId(querierAccountId)).map(
				(c) => c.id
			)
		);

		// Check if the user or their companies own the job the bid was sent on
		const isOwner = bids.some((b) => {
			const { accountId, companyId } = b.job.owner;
			return (
				accountId === querierAccountId ||
				(companyId && ownedCompanyIds.has(companyId))
			);
		});

		if (!isOwner) {
			throw new Error("you are not the owner of the job the bid was sent on");
		}

		return await this.UpdateStatusMany(ids, bidStatus.enumValues[2]);
	}
}

// Create  global service
export default registerService("bidQueryClient", () => new BidsQueryClient(db));
