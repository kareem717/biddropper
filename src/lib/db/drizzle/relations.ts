import { relations } from "drizzle-orm/relations";
import { accounts, accountCompanyReccomendationHistories, companies, accountViewHistories, jobs, jobAnalytics, accountJobReccomendationHistories, accountJobFavourites, bids, addresses, messageCompanyRecipients, messages, messageAccountRecipients, messageThread, usersInAuth, companyAnalytics, companyJobs, accountJobs, jobBids, companyIndustries, industries, jobIndustries } from "./schema";

export const accountCompanyReccomendationHistoriesRelations = relations(accountCompanyReccomendationHistories, ({one}) => ({
	account: one(accounts, {
		fields: [accountCompanyReccomendationHistories.accountId],
		references: [accounts.id]
	}),
	company: one(companies, {
		fields: [accountCompanyReccomendationHistories.companyId],
		references: [companies.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one, many}) => ({
	accountCompanyReccomendationHistories: many(accountCompanyReccomendationHistories),
	accountViewHistories: many(accountViewHistories),
	accountJobReccomendationHistories: many(accountJobReccomendationHistories),
	accountJobFavourites: many(accountJobFavourites),
	messageAccountRecipients: many(messageAccountRecipients),
	messages: many(messages),
	companies: many(companies),
	usersInAuth: one(usersInAuth, {
		fields: [accounts.userId],
		references: [usersInAuth.id]
	}),
	accountJobs: many(accountJobs),
}));

export const companiesRelations = relations(companies, ({one, many}) => ({
	accountCompanyReccomendationHistories: many(accountCompanyReccomendationHistories),
	accountViewHistories: many(accountViewHistories),
	bids: many(bids),
	messageCompanyRecipients: many(messageCompanyRecipients),
	messages: many(messages),
	address: one(addresses, {
		fields: [companies.addressId],
		references: [addresses.id]
	}),
	account: one(accounts, {
		fields: [companies.ownerId],
		references: [accounts.id]
	}),
	companyAnalytics: many(companyAnalytics),
	companyJobs: many(companyJobs),
	companyIndustries: many(companyIndustries),
}));

export const accountViewHistoriesRelations = relations(accountViewHistories, ({one}) => ({
	account: one(accounts, {
		fields: [accountViewHistories.accountId],
		references: [accounts.id]
	}),
	company: one(companies, {
		fields: [accountViewHistories.companyId],
		references: [companies.id]
	}),
	job: one(jobs, {
		fields: [accountViewHistories.jobId],
		references: [jobs.id]
	}),
}));

export const jobsRelations = relations(jobs, ({one, many}) => ({
	accountViewHistories: many(accountViewHistories),
	jobAnalytics: many(jobAnalytics),
	accountJobReccomendationHistories: many(accountJobReccomendationHistories),
	accountJobFavourites: many(accountJobFavourites),
	address: one(addresses, {
		fields: [jobs.addressId],
		references: [addresses.id]
	}),
	companyJobs: many(companyJobs),
	accountJobs: many(accountJobs),
	jobBids: many(jobBids),
	jobIndustries: many(jobIndustries),
}));

export const jobAnalyticsRelations = relations(jobAnalytics, ({one}) => ({
	job: one(jobs, {
		fields: [jobAnalytics.jobId],
		references: [jobs.id]
	}),
}));

export const accountJobReccomendationHistoriesRelations = relations(accountJobReccomendationHistories, ({one}) => ({
	account: one(accounts, {
		fields: [accountJobReccomendationHistories.accountId],
		references: [accounts.id]
	}),
	job: one(jobs, {
		fields: [accountJobReccomendationHistories.jobId],
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

export const bidsRelations = relations(bids, ({one, many}) => ({
	company: one(companies, {
		fields: [bids.senderCompanyId],
		references: [companies.id]
	}),
	jobBids: many(jobBids),
}));

export const addressesRelations = relations(addresses, ({many}) => ({
	jobs: many(jobs),
	companies: many(companies),
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

export const messagesRelations = relations(messages, ({one, many}) => ({
	messageCompanyRecipients: many(messageCompanyRecipients),
	messageAccountRecipients: many(messageAccountRecipients),
	messageThreads: many(messageThread),
	account: one(accounts, {
		fields: [messages.senderAccountId],
		references: [accounts.id]
	}),
	company: one(companies, {
		fields: [messages.senderCompanyId],
		references: [companies.id]
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

export const companyAnalyticsRelations = relations(companyAnalytics, ({one}) => ({
	company: one(companies, {
		fields: [companyAnalytics.companyId],
		references: [companies.id]
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