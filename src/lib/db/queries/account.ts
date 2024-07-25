import QueryClient from ".";
import { eq, and, isNull, not, sql } from "drizzle-orm";
import { accounts } from "@/lib/db/drizzle/schema";
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
}

// Create  global service
export default registerService(
	"accountQueryClient",
	() => new AccountQueryClient(db)
);
