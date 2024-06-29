import { Context } from "@/lib/trpc/context";
import {
	NewNotification,
	NewNotificationSchema,
} from "@/lib/validations/notification";
import { notifications } from "@/lib/db/drizzle/schema";
import { PgSelect } from "drizzle-orm/pg-core";
import { AnyColumn, SQL, asc, desc, gt, lt, and } from "drizzle-orm";

export const createNotification = async (
	input: NewNotification,
	ctx: Context
) => {
	const res = NewNotificationSchema.safeParse(input);
	if (!res.success) {
		throw new Error(res.error.message);
	}

	await ctx.db.insert(notifications).values({
		...res.data,
	});
};

export type CursorPaginationOptions = {
	cursor?: string;
	limit?: number;
	where?: SQL<unknown>[];
	orderByExpr?: SQL<unknown>;
};

export const withCursorPagination = <T extends PgSelect>(
	query: T,
	orderByCol: AnyColumn,
	options: CursorPaginationOptions
) => {
	return query
		.where(
			and(
				...(options.where || []),
				options.cursor ? gt(orderByCol, options.cursor) : undefined
			)
		)
		.orderBy(options.orderByExpr || asc(orderByCol))
		.limit((options.limit || 10) + 1);
};

export const generateCursorResponse = <T extends Record<string, any>>(
	cursorKeyPath: string,
	data: T[],
	pageSize: number
) => {
	// Utility function to get nested value
	const getNestedValue = (obj: T, path: string) => {
		return path.split(".").reduce((acc, part) => acc && acc[part], obj);
	};

	const hasNextPage = data.length > pageSize;
	const nextCursor = hasNextPage
		? getNestedValue(data[pageSize - 1], cursorKeyPath)
		: undefined;

	return { data: data.slice(0, pageSize), nextCursor };
};
