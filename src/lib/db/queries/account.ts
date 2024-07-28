import QueryClient, { OffsetPaginationOptions } from ".";
import { eq, and, isNull, not, sql, desc } from "drizzle-orm";
import { union } from "drizzle-orm/pg-core";
import {
	accountCompanyViewHistories,
	accountJobViewHistories,
	accounts,
	companies,
	jobs,
} from "@/lib/db/drizzle/schema";
import { registerService } from "@/lib/utils";
import { db } from "..";
import { NewAccount, EditAccount } from "./validation";

class AccountQueryClient extends QueryClient {
	async Create(values: NewAccount) {
		await this.caller.insert(accounts).values({
			...values,
		});
	}

	async GetDetailedByUserId(userId: string) {
		const [account] = await this.caller
			.select()
			.from(accounts)
			.where(and(eq(accounts.userId, userId)));

		return account;
	}

	async GetBasicManyByKeyword(
		querierAccountId: string,
		keywordQuery: string,
		page: number,
		pageSize: number,
		includeDeleted: boolean = false
	) {
		const res = await this.WithOffsetPagination(
			this.caller
				.select({
					id: accounts.id,
					username: accounts.username,
					deletedAt: accounts.deletedAt,
				})
				.from(accounts)
				.where(
					and(
						not(eq(accounts.id, querierAccountId)),
						includeDeleted ? undefined : isNull(accounts.deletedAt),
						sql`accounts.english_search_vector @@ WEBSEARCH_TO_TSQUERY('english',${keywordQuery})`
					)
				)
				.orderBy(
					sql`ts_rank(accounts.english_search_vector, WEBSEARCH_TO_TSQUERY('english', ${keywordQuery}))`
				)
				.$dynamic(),
			page,
			pageSize
		);

		return this.GenerateOffsetPaginationResponse(res, page, pageSize);
	}

	async Update(values: EditAccount) {
		if (!values.id) {
			throw new Error("Account ID is required");
		}

		await this.caller
			.update(accounts)
			.set(values)
			.where(eq(accounts.id, values.id));
	}

	async GetHistoryByAccountId(
		accountId: string,
		pagination: OffsetPaginationOptions
	) {
		const history = await this.WithOffsetPagination(
			union(
				this.caller
					.select({
						companyId: accountCompanyViewHistories.companyId,
						companyName: companies.name,
						jobId: sql<string>`null`,
						jobTitle: sql<string>`null`,
						createdAt: accountCompanyViewHistories.createdAt,
					})
					.from(accountCompanyViewHistories)
					.innerJoin(
						companies,
						eq(accountCompanyViewHistories.companyId, companies.id)
					)
					.where(
						and(
							eq(accountCompanyViewHistories.accountId, accountId),
							isNull(accountCompanyViewHistories.deletedAt)
						)
					),
				this.caller
					.select({
						companyId: sql<string>`null`,
						companyName: sql<string>`null`,
						jobId: accountJobViewHistories.jobId,
						jobTitle: jobs.title,
						createdAt: accountJobViewHistories.createdAt,
					})
					.from(accountJobViewHistories)
					.innerJoin(jobs, eq(accountJobViewHistories.jobId, jobs.id))
					.where(
						and(
							eq(accountJobViewHistories.accountId, accountId),
							isNull(accountJobViewHistories.deletedAt)
						)
					)
			)
				.orderBy(desc(sql`created_at`))
				.$dynamic(),
			pagination.page,
			pagination.pageSize
		);

		return this.GenerateOffsetPaginationResponse(
			history,
			pagination.page,
			pagination.pageSize
		);
	}

	async ClearHistory(accountId: string) {
		await this.caller.transaction(async (tx) => {
			await tx
				.update(accountCompanyViewHistories)
				.set({ deletedAt: new Date().toISOString() })
				.where(
					and(
						eq(accountCompanyViewHistories.accountId, accountId),
						isNull(accountCompanyViewHistories.deletedAt)
					)
				);

			await tx
				.update(accountJobViewHistories)
				.set({ deletedAt: new Date().toISOString() })
				.where(
					and(
						eq(accountJobViewHistories.accountId, accountId),
						isNull(accountJobViewHistories.deletedAt)
					)
				);
		});
	}
}

// Create  global service
export default registerService(
	"accountQueryClient",
	() => new AccountQueryClient(db)
);
