import { Context } from "@/lib/trpc/context";
import { NewMessage, NewMessageSchema } from "@/lib/validations/message";
import {
	accountJobs,
	companyJobs,
	jobs,
	messageAccountRecipients,
	messageCompanyRecipients,
	messages,
} from "@/lib/db/drizzle/schema";
import { PgSelect } from "drizzle-orm/pg-core";
import { SQL, and, eq, exists, inArray, or } from "drizzle-orm";
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

export const withOffsetPagination = <T extends PgSelect>(
	query: T,
	page: number,
	pageSize: number
) => {
	return query.offset((page - 1) * pageSize).limit(pageSize + 1);
};

export const generateOffsetPaginationResponse = <T>(
	res: T[],
	page: number,
	pageSize: number
) => {
	const hasNext = res.length > pageSize;
	const hasPrevious = page > 1;
	return {
		data: res.slice(0, pageSize),
		hasNext,
		hasPrevious,
		nextPage: hasNext ? page + 1 : null,
		previousPage: hasPrevious ? page - 1 : null,
	};
};

export const getOwnedJobs = async (ctx: Context, db: DB, accountId: string) => {
	const ownedCompanyIds =
		ctx.ownedCompanies?.map((company) => company.id) || [];

	return await db
		.select({ id: jobs.id })
		.from(jobs)
		.where(
			or(
				exists(
					db
						.select()
						.from(companyJobs)
						.where(
							and(
								eq(companyJobs.jobId, jobs.id),
								inArray(companyJobs.companyId, ownedCompanyIds)
							)
						)
				),
				exists(
					db
						.select()
						.from(accountJobs)
						.where(
							and(
								eq(accountJobs.jobId, jobs.id),
								eq(accountJobs.accountId, accountId)
							)
						)
				)
			)
		);
};

