import QueryClient from ".";
import { eq, and, isNull, sql, inArray, not, desc } from "drizzle-orm";
import {
	companies,
	addresses,
	dailyCompanyAggregateAnalytics,
	accountCompanyFavourites,
} from "@/lib/db/drizzle/schema";
import IndustryQueryClient from "./industry";
import AddressQC from "./address";
import { registerService } from "@/lib/utils";
import { db } from "..";
import { NewCompany, EditCompany } from "./validation";

class CompanyQueryClient extends QueryClient {
	async GetDetailedById(id: string) {
		const [res] = await this.caller
			.select()
			.from(companies)
			.where(eq(companies.id, id));

		return res;
	}

	async GetDetailedManyByOwnerId(
		ownerId: string,
		includeDeleted: boolean = false
	) {
		return await this.caller
			.select()
			.from(companies)
			.where(
				and(
					eq(companies.ownerId, ownerId),
					includeDeleted ? undefined : isNull(companies.deletedAt)
				)
			);
	}

	async GetExtendedById(id: string) {
		const [company] = await this.caller
			.select({
				company: companies,
				address: addresses,
			})
			.from(companies)
			.where(eq(companies.id, id))
			.innerJoin(addresses, eq(companies.addressId, addresses.id));

		const industries = await IndustryQueryClient.GetDetailedManyByCompanyId(id);

		return {
			...company.company,
			address: company.address,
			industries: industries,
		};
	}

	async GetBasicManyByKeyword(
		keyword: string,
		page: number,
		pageSize: number,
		includeDeleted: boolean = false,
		ownerId: string // querier's id
	) {
		const ownedCompanies = await this.GetDetailedManyByOwnerId(ownerId, true);
		const ownedCompanyIds = ownedCompanies.map((company) => company.id);

		const res = await this.WithOffsetPagination(
			this.caller
				.select({
					id: companies.id,
					name: companies.name,
					deletedAt: companies.deletedAt,
				})
				.from(companies)
				.where(
					and(
						not(inArray(companies.id, ownedCompanyIds)),
						includeDeleted ? undefined : isNull(companies.deletedAt),
						sql`companies.english_search_vector @@ WEBSEARCH_TO_TSQUERY('english',${keyword})`
					)
				)
				.orderBy(
					sql`ts_rank(companies.english_search_vector, WEBSEARCH_TO_TSQUERY('english', ${keyword}))`
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
		const ownedCompanies = await this.GetDetailedManyByOwnerId(userId, true);
		const ownedCompanyIds = ownedCompanies.map((company) => company.id);

		const dailyAnalytics = this.caller.$with("daily_analytics").as(
			this.caller
				.select({
					companyId: dailyCompanyAggregateAnalytics.companyId,
					viewCount: dailyCompanyAggregateAnalytics.viewCount,
					bidsReceivedCount: dailyCompanyAggregateAnalytics.bidsRecievedCount,
					favouritedCount: dailyCompanyAggregateAnalytics.favouritedCount,
					reccomendedCount: dailyCompanyAggregateAnalytics.reccomendedCount,
					dailyPopularity: sql<number>`
						((
							${dailyCompanyAggregateAnalytics.viewCount} +
							(0.8 * ${dailyCompanyAggregateAnalytics.bidsRecievedCount}) +
							(3 * ${dailyCompanyAggregateAnalytics.favouritedCount})
						) /
						CASE WHEN ${dailyCompanyAggregateAnalytics.reccomendedCount} = 0 
						THEN 1 ELSE ${dailyCompanyAggregateAnalytics.reccomendedCount} END
					) * 1000
					`.as("daily_popularity"),
				})
				.from(dailyCompanyAggregateAnalytics)
				.where(
					sql`${dailyCompanyAggregateAnalytics.createdAt} >= NOW() - INTERVAL '1 day'`
				)
		);

		const weeklyAnalytics = this.caller.$with("weekly_analytics").as(
			this.caller
				.select({
					companyId: dailyCompanyAggregateAnalytics.companyId,
					totalViewCount:
						sql<number>`SUM(${dailyCompanyAggregateAnalytics.viewCount})`.as(
							"total_view_count"
						),
					totalBidsReceivedCount:
						sql<number>`SUM(${dailyCompanyAggregateAnalytics.bidsRecievedCount})`.as(
							"total_bids_recieved_count"
						),
					totalFavouritedCount:
						sql<number>`SUM(${dailyCompanyAggregateAnalytics.favouritedCount})`.as(
							"total_favourited_count"
						),
					totalRecommendedCount:
						sql<number>`SUM(${dailyCompanyAggregateAnalytics.reccomendedCount})`.as(
							"total_reccomended_count"
						),
					weeklyPopularity: sql<number>`
						((
							SUM(${dailyCompanyAggregateAnalytics.viewCount}) + 
							(0.8 * SUM(${dailyCompanyAggregateAnalytics.bidsRecievedCount})) + 
							(3 * SUM(${dailyCompanyAggregateAnalytics.favouritedCount}))
						) /
						CASE WHEN SUM(${dailyCompanyAggregateAnalytics.reccomendedCount}) = 0 
						THEN 1 ELSE SUM(${dailyCompanyAggregateAnalytics.reccomendedCount}) END
					) * 1000
					`.as("weekly_popularity"),
				})
				.from(dailyCompanyAggregateAnalytics)
				.where(
					sql`${dailyCompanyAggregateAnalytics.createdAt} >= NOW() - INTERVAL '7 days'`
				)
				.groupBy(dailyCompanyAggregateAnalytics.companyId)
		);

		const res = await this.WithOffsetPagination(
			this.caller
				.with(weeklyAnalytics, dailyAnalytics)
				.select({
					id: companies.id,
					name: companies.name,
					deletedAt: companies.deletedAt,
					dailyPopularity: dailyAnalytics.dailyPopularity,
					weeklyPopularity: weeklyAnalytics.weeklyPopularity,
				})
				.from(companies)
				.innerJoin(dailyAnalytics, eq(companies.id, dailyAnalytics.companyId))
				.innerJoin(weeklyAnalytics, eq(companies.id, weeklyAnalytics.companyId))
				.where(
					and(
						not(inArray(companies.id, ownedCompanyIds)),
						includeDeleted ? undefined : isNull(companies.deletedAt)
					)
				)
				.groupBy(
					companies.id,
					companies.name,
					companies.deletedAt,
					dailyAnalytics.dailyPopularity,
					weeklyAnalytics.weeklyPopularity
				)
				.orderBy(desc(dailyAnalytics.dailyPopularity))
				.$dynamic(),
			page,
			pageSize
		);

		return this.GenerateOffsetPaginationResponse(res, page, pageSize);
	}

	async Create(values: NewCompany) {
		return await this.caller.transaction(async (tx) => {
			const newAddress = await AddressQC.withCaller(tx).Create(values.address);

			const [newCompany] = await tx
				.insert(companies)
				.values({
					...values,
					addressId: newAddress.id,
				})
				.returning();

			await IndustryQueryClient.withCaller(tx).CreateCompanyIndustries(
				values.industries.map((industry) => ({
					companyId: newCompany.id,
					industryId: industry,
				}))
			);

			return newCompany;
		});
	}

	async Update(values: EditCompany) {
		const { address, industries, id: companyId, ...company } = values;

		if (!companyId) {
			throw new Error("Company ID is required");
		}

		await this.caller.transaction(async (tx) => {
			const currAddress = await AddressQC.withCaller(tx).GetDetailedById(
				company.addressId
			);

			// if the address values have been changed, update the address
			const addressChanged = Object.entries(address).some(([key, value]) =>
				Object.entries(currAddress).some(([k, v]) => k === key && v !== value)
			);

			if (addressChanged) {
				// Since we're reusing address in other places, we don't wanna update the current address, rather create a new one
				const newAddress = await AddressQC.Create(address);
				company.addressId = newAddress.id;
			}

			// update the industries, if they already exist, do nothing, otherwise insert them
			const newIndustries = await IndustryQueryClient.withCaller(
				tx
			).CreateCompanyIndustries(
				industries.map((industry) => ({
					companyId: companyId,
					industryId: industry.id,
				}))
			);

			const newIndustriesIds = newIndustries.map(
				(industry) => industry.industryId
			);
			const industriesToDelete = industries.filter(
				(industry) => !newIndustriesIds.includes(industry.id)
			);

			await IndustryQueryClient.withCaller(tx).DeleteCompanyIndustries(
				companyId,
				industriesToDelete.map((industry) => industry.id)
			);

			await tx
				.update(companies)
				.set(company)
				.where(eq(companies.id, companyId));
		});
	}

	async Delete(id: string) {
		return await this.caller
			.update(companies)
			.set({ deletedAt: new Date().toISOString() })
			.where(eq(companies.id, id));
	}

	async Favorite(accountId: string, companyId: string) {
		return await this.caller
			.insert(accountCompanyFavourites)
			.values({
				accountId,
				companyId,
			})
			.returning();
	}

	async Unfavorite(accountId: string, companyId: string) {
		return await this.caller
			.update(accountCompanyFavourites)
			.set({
				deletedAt: new Date().toISOString(),
			})
			.where(
				and(
					eq(accountCompanyFavourites.accountId, accountId),
					eq(accountCompanyFavourites.companyId, companyId)
				)
			)
			.returning();
	}
	async GetIsCompanyFavouritedByAccountId(
		accountId: string,
		companyId: string
	) {
		const [res] = await this.caller
			.select()
			.from(accountCompanyFavourites)
			.where(
				and(
					eq(accountCompanyFavourites.accountId, accountId),
					eq(accountCompanyFavourites.companyId, companyId),
					isNull(accountCompanyFavourites.deletedAt)
				)
			);

		console.log(res);
		return res !== undefined;
	}

	async GetBasicManyFavouritedByAccountId(
		favouriterId: string,
		page: number,
		pageSize: number,
		includeDeleted: boolean = false
	) {
		
		const res = await this.WithOffsetPagination(
			this.caller
				.select({
					id: companies.id,
					name: companies.name,
					deletedAt: companies.deletedAt,
				})
				.from(companies)
				.innerJoin(
					accountCompanyFavourites,
					eq(companies.id, accountCompanyFavourites.companyId)
				)
				.where(
					and(
						includeDeleted ? undefined : isNull(accountCompanyFavourites.deletedAt),
						eq(accountCompanyFavourites.accountId, favouriterId)
					)
				)
				.orderBy(desc(accountCompanyFavourites.createdAt))
				.$dynamic(),
			page,
			pageSize
		);

		return this.GenerateOffsetPaginationResponse(res, page, pageSize);
	}
}

// Create global service
export default registerService(
	"companyQueryClient",
	() => new CompanyQueryClient(db)
);
