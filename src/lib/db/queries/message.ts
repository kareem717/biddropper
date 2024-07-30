import QueryClient from ".";
import {
	accounts,
	companies,
	messageAccountRecipients,
	messageCompanyRecipients,
	messageReplies,
	messages,
} from "@/lib/db/drizzle/schema";
import { eq, and, isNull, desc, sql, count, not } from "drizzle-orm";
import { registerService } from "@/lib/utils";
import { db } from "..";
import { NewMessage, UpdateRecipient } from "./validation";
import { union } from "drizzle-orm/pg-core";

class MessageQueryClient extends QueryClient {
	async Create(values: NewMessage) {
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

			if (values.replyTo) {
				await tx.insert(messageReplies).values(
					values.replyTo.map((replyTo) => ({
						messageId: msg.id,
						replyTo,
					}))
				);
			}

			return msg;
		});
	}

	async GetBasicById(messageId: string) {
		const [res] = await this.caller
			.select({
				id: messages.id,
				title: messages.title,
				description: sql<string>`substring(messages.description from 0 for 100)`,
				createdAt: messages.createdAt,
				updatedAt: messages.updatedAt,
				deletedAt: messages.deletedAt,
			})
			.from(messages)
			.where(eq(messages.id, messageId))
			.limit(1);

		return res;
	}

	async GetExtendedManyReceivedByAccountId(
		accountId: string,
		keywordQuery: string | undefined,
		page: number,
		pageSize: number,
		includeRead: boolean = false,
		includeDeleted: boolean = false
	) {
		const replyTo = this.caller.$with("replyTo").as(
			this.caller
				.select({
					messageId: messageReplies.messageId,
					replyTo: messageReplies.replyTo,
					createdAt: messageReplies.createdAt,
					updatedAt: messageReplies.updatedAt,
					deletedAt: messageReplies.deletedAt,
				})
				.from(messages)
				.innerJoin(messageReplies, eq(messages.id, messageReplies.messageId))
				.orderBy(desc(messageReplies.createdAt))
				.limit(1)
		);

		const res = await this.WithOffsetPagination(
			this.caller
				.with(replyTo)
				.select({
					messages,
					reciepient: {
						readAt: messageAccountRecipients.readAt,
						deletedAt: messageAccountRecipients.deletedAt,
					},
					senderCompany: {
						type: sql<string>`'company'`,
						id: companies.id,
						name: companies.name,
						deletedAt: companies.deletedAt,
					},
					senderAccount: {
						type: sql<string>`'account'`,
						id: accounts.id,
						name: accounts.username,
						deletedAt: accounts.deletedAt,
					},
					replyTo: {
						messageId: replyTo.messageId,
						replyTo: replyTo.replyTo,
						createdAt: replyTo.createdAt,
						updatedAt: replyTo.updatedAt,
						deletedAt: replyTo.deletedAt,
					},
				})
				.from(messages)
				.innerJoin(
					messageAccountRecipients,
					eq(messages.id, messageAccountRecipients.messageId)
				)
				.leftJoin(replyTo, eq(messages.id, replyTo.messageId))
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
							? sql`${messages.englishSearchVector} @@ WEBSEARCH_TO_TSQUERY('english',${keywordQuery})`
							: undefined
					)
				)
				.orderBy(
					keywordQuery
						? sql`ts_rank(${messages.englishSearchVector}, WEBSEARCH_TO_TSQUERY('english', ${keywordQuery}))`
						: desc(messages.createdAt),
					desc(messages.createdAt)
				)
				.$dynamic(),
			page,
			pageSize
		);

		console.log(res);

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
		console.log(companyId);
		const replyTo = this.caller.$with("replyTo").as(
			this.caller
				.select({
					messageId: messageReplies.messageId,
					replyTo: messageReplies.replyTo,
					createdAt: messageReplies.createdAt,
					updatedAt: messageReplies.updatedAt,
					deletedAt: messageReplies.deletedAt,
				})
				.from(messages)
				.innerJoin(messageReplies, eq(messages.id, messageReplies.messageId))
				.orderBy(desc(messageReplies.createdAt))
				.limit(1)
		);

		const res = await this.WithOffsetPagination(
			this.caller
				.with(replyTo)
				.select({
					messages,
					reciepient: {
						readAt: messageCompanyRecipients.readAt,
						deletedAt: messageCompanyRecipients.deletedAt,
					},
					senderCompany: {
						type: sql<string>`'company'`,
						id: companies.id,
						name: companies.name,
						deletedAt: companies.deletedAt,
					},
					senderAccount: {
						type: sql<string>`'account'`,
						id: accounts.id,
						name: accounts.username,
						deletedAt: accounts.deletedAt,
					},
					replyTo: {
						messageId: replyTo.messageId,
						replyTo: replyTo.replyTo,
						createdAt: replyTo.createdAt,
						updatedAt: replyTo.updatedAt,
						deletedAt: replyTo.deletedAt,
					},
				})
				.from(messages)
				.innerJoin(
					messageCompanyRecipients,
					eq(messages.id, messageCompanyRecipients.messageId)
				)
				.leftJoin(replyTo, eq(messages.id, replyTo.messageId))
				.leftJoin(accounts, eq(messages.senderAccountId, accounts.id))
				.leftJoin(companies, eq(messages.senderCompanyId, companies.id))
				.where(
					and(
						eq(messageCompanyRecipients.companyId, companyId),
						includeRead ? undefined : isNull(messageCompanyRecipients.readAt),
						includeDeleted
							? undefined
							: isNull(messageCompanyRecipients.deletedAt),
						keywordQuery
							? sql`${messages.englishSearchVector} @@ WEBSEARCH_TO_TSQUERY('english',${keywordQuery})`
							: undefined
					)
				)
				.orderBy(
					keywordQuery
						? sql`ts_rank(${messages.englishSearchVector}, WEBSEARCH_TO_TSQUERY('english', ${keywordQuery}))`
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

	async GetRecipientsByKeyword(keyword: string) {
		return await union(
			this.caller
				.select({
					type: sql<string>`'account'`,
					id: accounts.id,
					name: accounts.username,
					rank: sql<number>`ts_rank(accounts.english_search_vector, WEBSEARCH_TO_TSQUERY('english', ${keyword}))`.as(
						"rank"
					),
				})
				.from(accounts)
				.where(
					and(
						isNull(accounts.deletedAt),
						sql`accounts.english_search_vector @@ WEBSEARCH_TO_TSQUERY('english',${keyword})`
					)
				)
				.orderBy(desc(sql`rank`)),
			this.caller
				.select({
					type: sql<string>`'company'`,
					id: companies.id,
					name: companies.name,
					rank: sql<number>`ts_rank(companies.english_search_vector, WEBSEARCH_TO_TSQUERY('english', ${keyword}))`.as(
						"rank"
					),
				})
				.from(companies)
				.where(
					and(
						isNull(companies.deletedAt),
						sql`companies.english_search_vector @@ WEBSEARCH_TO_TSQUERY('english',${keyword})`
					)
				)
				.orderBy(desc(sql`rank`))
		)
			.limit(10)
			.orderBy(desc(sql`rank`));
	}
}

// Create global service
export default registerService(
	"messageQueryClient",
	() => new MessageQueryClient(db)
);
