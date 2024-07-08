import { relations } from "drizzle-orm/relations";
import { companies, bids, addresses, jobs, accounts, messages, messageCompanyRecipients, messageAccountRecipients, messageThread, usersInAuth, jobRecommendationHistory, jobViewHistory, accountJobFavourites, accountJobs, companyJobs, jobBids, companyIndustries, industries, jobIndustries } from "./schema";

export const bidsRelations = relations(bids, ({one, many}) => ({
	company: one(companies, {
		fields: [bids.senderCompanyId],
		references: [companies.id]
	}),
	jobBids: many(jobBids),
}));

export const companiesRelations = relations(companies, ({one, many}) => ({
	bids: many(bids),
	messages: many(messages),
	messageCompanyRecipients: many(messageCompanyRecipients),
	address: one(addresses, {
		fields: [companies.addressId],
		references: [addresses.id]
	}),
	account: one(accounts, {
		fields: [companies.ownerId],
		references: [accounts.id]
	}),
	companyJobs: many(companyJobs),
	companyIndustries: many(companyIndustries),
}));

export const jobsRelations = relations(jobs, ({one, many}) => ({
	address: one(addresses, {
		fields: [jobs.addressId],
		references: [addresses.id]
	}),
	jobRecommendationHistories: many(jobRecommendationHistory),
	jobViewHistories: many(jobViewHistory),
	accountJobFavourites: many(accountJobFavourites),
	accountJobs: many(accountJobs),
	companyJobs: many(companyJobs),
	jobBids: many(jobBids),
	jobIndustries: many(jobIndustries),
}));

export const addressesRelations = relations(addresses, ({many}) => ({
	jobs: many(jobs),
	companies: many(companies),
}));

export const messagesRelations = relations(messages, ({one, many}) => ({
	account: one(accounts, {
		fields: [messages.senderAccountId],
		references: [accounts.id]
	}),
	company: one(companies, {
		fields: [messages.senderCompanyId],
		references: [companies.id]
	}),
	messageCompanyRecipients: many(messageCompanyRecipients),
	messageAccountRecipients: many(messageAccountRecipients),
	messageThreads: many(messageThread),
}));

export const accountsRelations = relations(accounts, ({one, many}) => ({
	messages: many(messages),
	messageAccountRecipients: many(messageAccountRecipients),
	companies: many(companies),
	usersInAuth: one(usersInAuth, {
		fields: [accounts.userId],
		references: [usersInAuth.id]
	}),
	jobRecommendationHistories: many(jobRecommendationHistory),
	jobViewHistories: many(jobViewHistory),
	accountJobFavourites: many(accountJobFavourites),
	accountJobs: many(accountJobs),
}));

export const messageCompanyRecipientsRelations = relations(messageCompanyRecipients, ({one}) => ({
	company: one(companies, {
		fields: [messageCompanyRecipients.companyId],
		references: [companies.id]
	}),
	message: one(messages, {
		fields: [messageCompanyRecipients.messageId],
		references: [messages.id]
	}),
}));

export const messageAccountRecipientsRelations = relations(messageAccountRecipients, ({one}) => ({
	account: one(accounts, {
		fields: [messageAccountRecipients.accountId],
		references: [accounts.id]
	}),
	message: one(messages, {
		fields: [messageAccountRecipients.messageId],
		references: [messages.id]
	}),
}));

export const messageThreadRelations = relations(messageThread, ({one}) => ({
	message: one(messages, {
		fields: [messageThread.messageId],
		references: [messages.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	accounts: many(accounts),
}));

export const jobRecommendationHistoryRelations = relations(jobRecommendationHistory, ({one}) => ({
	account: one(accounts, {
		fields: [jobRecommendationHistory.accountId],
		references: [accounts.id]
	}),
	job: one(jobs, {
		fields: [jobRecommendationHistory.jobId],
		references: [jobs.id]
	}),
}));

export const jobViewHistoryRelations = relations(jobViewHistory, ({one}) => ({
	account: one(accounts, {
		fields: [jobViewHistory.accountId],
		references: [accounts.id]
	}),
	job: one(jobs, {
		fields: [jobViewHistory.jobId],
		references: [jobs.id]
	}),
}));

export const accountJobFavouritesRelations = relations(accountJobFavourites, ({one}) => ({
	account: one(accounts, {
		fields: [accountJobFavourites.accountId],
		references: [accounts.id]
	}),
	job: one(jobs, {
		fields: [accountJobFavourites.jobId],
		references: [jobs.id]
	}),
}));

export const accountJobsRelations = relations(accountJobs, ({one}) => ({
	account: one(accounts, {
		fields: [accountJobs.accountId],
		references: [accounts.id]
	}),
	job: one(jobs, {
		fields: [accountJobs.jobId],
		references: [jobs.id]
	}),
}));

export const companyJobsRelations = relations(companyJobs, ({one}) => ({
	company: one(companies, {
		fields: [companyJobs.companyId],
		references: [companies.id]
	}),
	job: one(jobs, {
		fields: [companyJobs.jobId],
		references: [jobs.id]
	}),
}));

export const jobBidsRelations = relations(jobBids, ({one}) => ({
	bid: one(bids, {
		fields: [jobBids.bidId],
		references: [bids.id]
	}),
	job: one(jobs, {
		fields: [jobBids.jobId],
		references: [jobs.id]
	}),
}));

export const companyIndustriesRelations = relations(companyIndustries, ({one}) => ({
	company: one(companies, {
		fields: [companyIndustries.companyId],
		references: [companies.id]
	}),
	industry: one(industries, {
		fields: [companyIndustries.industryId],
		references: [industries.id]
	}),
}));

export const industriesRelations = relations(industries, ({many}) => ({
	companyIndustries: many(companyIndustries),
	jobIndustries: many(jobIndustries),
}));

export const jobIndustriesRelations = relations(jobIndustries, ({one}) => ({
	industry: one(industries, {
		fields: [jobIndustries.industryId],
		references: [industries.id]
	}),
	job: one(jobs, {
		fields: [jobIndustries.jobId],
		references: [jobs.id]
	}),
}));