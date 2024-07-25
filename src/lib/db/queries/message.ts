import QueryClient from ".";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
	accounts,
	companies,
	messageAccountRecipients,
	messageCompanyRecipients,
	messages,
} from "@/lib/db/drizzle/schema";
import { eq, and, isNull, desc, sql, count } from "drizzle-orm";
import { registerService } from "@/lib/utils";
import { db } from "..";
import { NewMessage, UpdateRecipient } from "./validation";

class MessageQueryClient extends QueryClient {
	async Create(values: NewMessage) {
		if (!values.senderAccountId && !values.senderCompanyId) {
			throw new Error("you must provide a sender");
		}

		if (
			values.recipients.accountIds.length === 0 &&
			values.recipients.companyIds.length === 0
		) {
			throw new Error("you cannot send a message to no one");
		}

		return await this.caller.transaction(async (tx) => {
			const [msg] = await tx.insert(messages).values(values).returning();

			if (values.recipients.accountIds.length > 0) {
				await tx.insert(messageAccountRecipients).values(
					values.recipients.accountIds.map((accountId) => ({
						messageId: msg.id,
						accountId,
					}))
				);
			}

			if (values.recipients.companyIds.length > 0) {
				await tx.insert(messageCompanyRecipients).values(
					values.recipients.companyIds.map((companyId) => ({
						messageId: msg.id,
						companyId,
					}))
				);
			}
		});
	}

	async GetExtendedManyReceivedByAccountId(
		accountId: string,
		keywordQuery: string | undefined,
		page: number,
		pageSize: number,
		includeRead: boolean = false,
		includeDeleted: boolean = false
	) {
		const res = await this.WithOffsetPagination(
			this.caller
				.select({
					messages,
					readAt: messageAccountRecipients.readAt,
					deletedAt: messageAccountRecipients.deletedAt,
					senderCompany: {
						id: companies.id,
						name: companies.name,
						deletedAt: companies.deletedAt,
					},
					senderAccount: {
						id: accounts.id,
						name: accounts.username,
						deletedAt: accounts.deletedAt,
					},
				})
				.from(messages)
				.innerJoin(
					messageAccountRecipients,
					eq(messages.id, messageAccountRecipients.messageId)
				)
				.leftJoin(accounts, eq(messages.senderAccountId, accounts.id))
				.leftJoin(companies, eq(messages.senderCompanyId, companies.id))
				.where(
					and(
						eq(messageAccountRecipients.accountId, accountId),
						includeRead ? undefined : isNull(messageAccountRecipients.readAt),
						includeDeleted
							? undefined
							: isNull(messageAccountRecipients.deletedAt),
						keywordQuery
							? sql`messages.english_search_vector @@ WEBSEARCH_TO_TSQUERY('english',${keywordQuery})`
							: undefined
					)
				)
				.orderBy(
					keywordQuery
						? sql`ts_rank(messages.english_search_vector, WEBSEARCH_TO_TSQUERY('english', ${keywordQuery}))`
						: desc(messages.createdAt),
					desc(messages.createdAt)
				)
				.$dynamic(),
			page,
			pageSize
		);

		return this.GenerateOffsetPaginationResponse(res, page, pageSize);
	}

	async GetExtendedManyReceivedByCompanyId(
		companyId: string,
		keywordQuery: string | undefined,
		page: number,
		pageSize: number,
		includeRead: boolean = false,
		includeDeleted: boolean = false
	) {
		const res = await this.WithOffsetPagination(
			this.caller
				.select({
					messages,
					readAt: messageCompanyRecipients.readAt,
					deletedAt: messageCompanyRecipients.deletedAt,
					senderCompany: {
						id: companies.id,
						name: companies.name,
						deletedAt: companies.deletedAt,
					},
					senderAccount: {
						id: accounts.id,
						name: accounts.username,
						deletedAt: accounts.deletedAt,
					},
				})
				.from(messages)
				.innerJoin(
					messageCompanyRecipients,
					eq(messages.id, messageCompanyRecipients.messageId)
				)
				.leftJoin(accounts, eq(messages.senderAccountId, accounts.id))
				.leftJoin(companies, eq(messages.senderCompanyId, companies.id))
				.where(
					and(
						eq(messageCompanyRecipients.companyId, companyId),
						includeRead ? undefined : isNull(messageAccountRecipients.readAt),
						includeDeleted
							? undefined
							: isNull(messageAccountRecipients.deletedAt),
						keywordQuery
							? sql`messages.english_search_vector @@ WEBSEARCH_TO_TSQUERY('english',${keywordQuery})`
							: undefined
					)
				)
				.orderBy(
					keywordQuery
						? sql`ts_rank(messages.english_search_vector, WEBSEARCH_TO_TSQUERY('english', ${keywordQuery}))`
						: desc(messages.createdAt),
					desc(messages.createdAt)
				)
				.$dynamic(),
			page,
			pageSize
		);

		return this.GenerateOffsetPaginationResponse(res, page, pageSize);
	}

	async GetUnreadCountByAccountId(accountId: string) {
		const [cnt] = await this.caller
			.select({ count: count() })
			.from(messages)
			.innerJoin(
				messageAccountRecipients,
				eq(messages.id, messageAccountRecipients.messageId)
			)
			.where(
				and(
					eq(messageAccountRecipients.accountId, accountId),
					isNull(messageAccountRecipients.readAt),
					isNull(messageAccountRecipients.deletedAt)
				)
			)
			.groupBy(messageAccountRecipients.accountId);

		return cnt;
	}

	async GetUnreadCountByCompanyId(companyId: string) {
		return await this.caller
			.select({ count: count() })
			.from(messages)
			.innerJoin(
				messageCompanyRecipients,
				eq(messages.id, messageCompanyRecipients.messageId)
			)
			.where(
				and(
					eq(messageCompanyRecipients.companyId, companyId),
					isNull(messageCompanyRecipients.readAt),
					isNull(messageCompanyRecipients.deletedAt)
				)
			)
			.groupBy(messageCompanyRecipients.companyId);
	}

	async UpdateRecipient(values: UpdateRecipient) {
		const { readAt, deletedAt } = values;
		let res;

		if ("accountId" in values.recipient) {
			res = await this.caller

				.update(messageAccountRecipients)
				.set({
					readAt,
					deletedAt,
				})
				.where(eq(messageAccountRecipients.messageId, values.messageId))
				.returning();
		} else if ("companyId" in values.recipient) {
			res = await this.caller
				.update(messageCompanyRecipients)
				.set({
					readAt,
					deletedAt,
				})
				.where(eq(messageCompanyRecipients.messageId, values.messageId))
				.returning();
		} else {
			throw new Error("invalid recipient");
		}

		return res;
	}
}

// Create global service
export default registerService(
	"messageQueryClient",
	() => new MessageQueryClient(db)
);
