import { relations } from "drizzle-orm/relations";
import { accounts, accountJobViewHistories, jobs, accountCompanyViewHistories, companies, accountCompanyReccomendationHistories, bids, addresses, messageCompanyRecipients, messages, messageAccountRecipients, messageThread, usersInAuth, accountJobReccomendationHistories, accountJobFavourites, jobBids, accountJobs, companyJobs, companyIndustries, industries, jobIndustries, accountCompanyFavourites, dailyCompanyAggregateAnalytics, dailyJobAggregateAnalytics } from "./schema";

export const accountJobViewHistoriesRelations = relations(accountJobViewHistories, ({one}) => ({
	account: one(accounts, {
		fields: [accountJobViewHistories.accountId],
		references: [accounts.id]
	}),
	job: one(jobs, {
		fields: [accountJobViewHistories.jobId],
		references: [jobs.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one, many}) => ({
	accountJobViewHistories: many(accountJobViewHistories),
	accountCompanyViewHistories: many(accountCompanyViewHistories),
	accountCompanyReccomendationHistories: many(accountCompanyReccomendationHistories),
	messageAccountRecipients: many(messageAccountRecipients),
	messages: many(messages),
	companies: many(companies),
	usersInAuth: one(usersInAuth, {
		fields: [accounts.userId],
		references: [usersInAuth.id]
	}),
	accountJobReccomendationHistories: many(accountJobReccomendationHistories),
	accountJobFavourites: many(accountJobFavourites),
	accountJobs: many(accountJobs),
	accountCompanyFavourites: many(accountCompanyFavourites),
}));

export const jobsRelations = relations(jobs, ({one, many}) => ({
	accountJobViewHistories: many(accountJobViewHistories),
	address: one(addresses, {
		fields: [jobs.addressId],
		references: [addresses.id]
	}),
	accountJobReccomendationHistories: many(accountJobReccomendationHistories),
	accountJobFavourites: many(accountJobFavourites),
	jobBids: many(jobBids),
	accountJobs: many(accountJobs),
	companyJobs: many(companyJobs),
	jobIndustries: many(jobIndustries),
}));

export const accountCompanyViewHistoriesRelations = relations(accountCompanyViewHistories, ({one}) => ({
	account: one(accounts, {
		fields: [accountCompanyViewHistories.accountId],
		references: [accounts.id]
	}),
	company: one(companies, {
		fields: [accountCompanyViewHistories.companyId],
		references: [companies.id]
	}),
}));

export const companiesRelations = relations(companies, ({one, many}) => ({
	accountCompanyViewHistories: many(accountCompanyViewHistories),
	accountCompanyReccomendationHistories: many(accountCompanyReccomendationHistories),
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
	companyJobs: many(companyJobs),
	companyIndustries: many(companyIndustries),
	accountCompanyFavourites: many(accountCompanyFavourites),
	dailyCompanyAggregateAnalytics: many(dailyCompanyAggregateAnalytics),
	dailyJobAggregateAnalytics: many(dailyJobAggregateAnalytics),
}));

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

export const accountCompanyFavouritesRelations = relations(accountCompanyFavourites, ({one}) => ({
	account: one(accounts, {
		fields: [accountCompanyFavourites.accountId],
		references: [accounts.id]
	}),
	company: one(companies, {
		fields: [accountCompanyFavourites.companyId],
		references: [companies.id]
	}),
}));

export const dailyCompanyAggregateAnalyticsRelations = relations(dailyCompanyAggregateAnalytics, ({one}) => ({
	company: one(companies, {
		fields: [dailyCompanyAggregateAnalytics.companyId],
		references: [companies.id]
	}),
}));

export const dailyJobAggregateAnalyticsRelations = relations(dailyJobAggregateAnalytics, ({one}) => ({
	company: one(companies, {
		fields: [dailyJobAggregateAnalytics.jobId],
		references: [companies.id]
	}),
}));