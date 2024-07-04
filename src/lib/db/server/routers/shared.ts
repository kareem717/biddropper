import { Context } from "@/lib/trpc/context";
import { NewMessage, NewMessageSchema } from "@/lib/validations/message";
import { messageAccountRecipients, messageAccountSender, messageCompanyRecipients, messageCompanySender, messages } from "@/lib/db/drizzle/schema";
import { PgSelect } from "drizzle-orm/pg-core";
import { AnyColumn, SQL, asc, desc, gt, lt, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { DB } from "@/lib/db";

export const createMessage = async (input: NewMessage, ctx: Context, db: DB) => {
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

	const { sender, recipients, ...message } = res.data;
	const { accountIds, companyIds } = recipients;

	if (accountIds.length === 0 && companyIds.length === 0) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "you cannot send a message to no one",
		});
	}

	const isAccountSender = sender.accountId === ctx.account.id;
	const isCompanySender = sender.companyId
		? ctx.ownedCompanies?.some((company) => company.id === sender.companyId)
		: false;

	if (!isAccountSender && !isCompanySender) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "you cannot send a message on behalf of this account or company",
		});
	}

	await db.transaction(async (tx) => {
		const [msg] = await tx
			.insert(messages)
			.values(input)
			.returning({ id: messages.id });

		if (isAccountSender) {
			await tx.insert(messageAccountSender).values({
				messageId: msg.id,
				accountId: ctx.account!.id,
			});
		} else if (isCompanySender && sender.companyId) {
			await tx.insert(messageCompanySender).values({
				messageId: msg.id,
				companyId: sender.companyId,
			});
		}

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
