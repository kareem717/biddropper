import { Context } from "@/lib/trpc/context";
import { NewMessage, NewMessageSchema } from "@/lib/validations/message";
import {
	messageAccountRecipients,
	messageCompanyRecipients,
	messages,
} from "@/lib/db/drizzle/schema";
import { PgSelect } from "drizzle-orm/pg-core";
import { AnyColumn, SQL, asc, desc, gt, lt, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { DB } from "@/lib/db";

export const createMessage = async (
	input: NewMessage,
	ctx: Context,
	db: DB
) => {
	const res = NewMessageSchema.safeParse(input);
	if (!res.success) {
		throw new Error(res.error.message);
	}

	if (!ctx.account) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "you cannot send a message without being logged in",
		});
	}

	const { recipients, ...message } = res.data;
	const { accountIds, companyIds } = recipients;

	if (!message.senderAccountId && !message.senderCompanyId) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "you must provide a sender",
		});
	}

	if (accountIds.length === 0 && companyIds.length === 0) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "you cannot send a message to no one",
		});
	}

	await db.transaction(async (tx) => {
		const [msg] = await tx
			.insert(messages)
			.values(message)
			.returning({ id: messages.id });

		if (recipients.accountIds.length > 0) {
			await tx.insert(messageAccountRecipients).values(
				recipients.accountIds.map((accountId) => ({
					messageId: msg.id,
					accountId,
				}))
			);
		}

		if (recipients.companyIds.length > 0) {
			await tx.insert(messageCompanyRecipients).values(
				recipients.companyIds.map((companyId) => ({
					messageId: msg.id,
					companyId,
				}))
			);
		}
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
