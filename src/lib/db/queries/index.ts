import { PgTransaction, PgSelect } from "drizzle-orm/pg-core";
import { SQL } from "drizzle-orm";
import { DB } from "..";
import { z } from "zod";

// 1. Basic Mode: Fetches minimal details.
// 2. Detailed Mode: Fetches full details of the resource.
// 3. Extended Mode: Fetches full details along with related data.

type CallerType = DB | PgTransaction<any, any, any>;

type OffsetPaginationOptions = z.infer<typeof OffsetPaginationOptionsSchema>;
const OffsetPaginationOptionsSchema = z.object({
	page: z.number().optional().default(1),
	pageSize: z.number().optional().default(10),
});

class QueryClient {
	caller: CallerType;

	constructor(caller: CallerType) {
		this.caller = caller;
	}

	WithOffsetPagination<T extends PgSelect>(
		query: T,
		page: number,
		pageSize: number
	) {
		return query.offset((page - 1) * pageSize).limit(pageSize + 1);
	}

	GenerateOffsetPaginationResponse<T>(
		res: T[],
		page: number,
		pageSize: number
	) {
		const hasNext = res.length > pageSize;
		const hasPrevious = page > 1;
		return {
			data: res.slice(0, pageSize),
			hasNext,
			hasPrevious,
			nextPage: hasNext ? page + 1 : null,
			previousPage: hasPrevious ? page - 1 : null,
		};
	}
}

export type QueryClientType = typeof QueryClient;
export default QueryClient;
