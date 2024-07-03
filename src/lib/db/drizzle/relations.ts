import { relations } from "drizzle-orm/relations";
import { companies, projects, bids, accounts, reviews, messageCompanySender, messages, messageAccountSender, messageCompanyRecipients, messageAccountRecipients, messageThread, usersInAuth, accountSubscriptions, contracts, addresses, jobs, media, jobBids, contractBids, companyIndustries, industries, jobIndustries, accountJobs, contractJobs, companyJobs, jobMedia, projectMedia, reviewMedia } from "./schema";

export const projectsRelations = relations(projects, ({one, many}) => ({
	company: one(companies, {
		fields: [projects.companyId],
		references: [companies.id]
	}),
	projectMedias: many(projectMedia),
}));

export const companiesRelations = relations(companies, ({one, many}) => ({
	projects: many(projects),
	bids: many(bids),
	reviews: many(reviews),
	messageCompanySenders: many(messageCompanySender),
	messageCompanyRecipients: many(messageCompanyRecipients),
	contracts: many(contracts),
	address: one(addresses, {
		fields: [companies.addressId],
		references: [addresses.id]
	}),
	media: one(media, {
		fields: [companies.imageId],
		references: [media.id]
	}),
	account: one(accounts, {
		fields: [companies.ownerId],
		references: [accounts.id]
	}),
	companyIndustries: many(companyIndustries),
	companyJobs: many(companyJobs),
}));

export const bidsRelations = relations(bids, ({one, many}) => ({
	company: one(companies, {
		fields: [bids.senderCompanyId],
		references: [companies.id]
	}),
	jobBids: many(jobBids),
	contractBids: many(contractBids),
}));

export const reviewsRelations = relations(reviews, ({one, many}) => ({
	account: one(accounts, {
		fields: [reviews.authorId],
		references: [accounts.id]
	}),
	company: one(companies, {
		fields: [reviews.companyId],
		references: [companies.id]
	}),
	reviewMedias: many(reviewMedia),
}));

export const accountsRelations = relations(accounts, ({one, many}) => ({
	reviews: many(reviews),
	messageAccountSenders: many(messageAccountSender),
	messageAccountRecipients: many(messageAccountRecipients),
	usersInAuth: one(usersInAuth, {
		fields: [accounts.userId],
		references: [usersInAuth.id]
	}),
	accountSubscriptions: many(accountSubscriptions),
	companies: many(companies),
	accountJobs: many(accountJobs),
}));

export const messageCompanySenderRelations = relations(messageCompanySender, ({one}) => ({
	company: one(companies, {
		fields: [messageCompanySender.companyId],
		references: [companies.id]
	}),
	message: one(messages, {
		fields: [messageCompanySender.messageId],
		references: [messages.id]
	}),
}));

export const messagesRelations = relations(messages, ({many}) => ({
	messageCompanySenders: many(messageCompanySender),
	messageAccountSenders: many(messageAccountSender),
	messageCompanyRecipients: many(messageCompanyRecipients),
	messageAccountRecipients: many(messageAccountRecipients),
	messageThreads: many(messageThread),
}));

export const messageAccountSenderRelations = relations(messageAccountSender, ({one}) => ({
	account: one(accounts, {
		fields: [messageAccountSender.accountId],
		references: [accounts.id]
	}),
	message: one(messages, {
		fields: [messageAccountSender.messageId],
		references: [messages.id]
	}),
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

export const accountSubscriptionsRelations = relations(accountSubscriptions, ({one}) => ({
	account: one(accounts, {
		fields: [accountSubscriptions.accountId],
		references: [accounts.id]
	}),
}));

export const contractsRelations = relations(contracts, ({one, many}) => ({
	company: one(companies, {
		fields: [contracts.companyId],
		references: [companies.id]
	}),
	contractBids: many(contractBids),
	contractJobs: many(contractJobs),
}));

export const jobsRelations = relations(jobs, ({one, many}) => ({
	address: one(addresses, {
		fields: [jobs.addressId],
		references: [addresses.id]
	}),
	jobBids: many(jobBids),
	jobIndustries: many(jobIndustries),
	accountJobs: many(accountJobs),
	contractJobs: many(contractJobs),
	companyJobs: many(companyJobs),
	jobMedias: many(jobMedia),
}));

export const addressesRelations = relations(addresses, ({many}) => ({
	jobs: many(jobs),
	companies: many(companies),
}));

export const mediaRelations = relations(media, ({many}) => ({
	companies: many(companies),
	jobMedias: many(jobMedia),
	projectMedias: many(projectMedia),
	reviewMedias: many(reviewMedia),
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

export const contractBidsRelations = relations(contractBids, ({one}) => ({
	bid: one(bids, {
		fields: [contractBids.bidId],
		references: [bids.id]
	}),
	contract: one(contracts, {
		fields: [contractBids.contractId],
		references: [contracts.id]
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

export const contractJobsRelations = relations(contractJobs, ({one}) => ({
	contract: one(contracts, {
		fields: [contractJobs.contractId],
		references: [contracts.id]
	}),
	job: one(jobs, {
		fields: [contractJobs.jobId],
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

export const jobMediaRelations = relations(jobMedia, ({one}) => ({
	job: one(jobs, {
		fields: [jobMedia.jobId],
		references: [jobs.id]
	}),
	media: one(media, {
		fields: [jobMedia.mediaId],
		references: [media.id]
	}),
}));

export const projectMediaRelations = relations(projectMedia, ({one}) => ({
	media: one(media, {
		fields: [projectMedia.mediaId],
		references: [media.id]
	}),
	project: one(projects, {
		fields: [projectMedia.projectId],
		references: [projects.id]
	}),
}));

export const reviewMediaRelations = relations(reviewMedia, ({one}) => ({
	media: one(media, {
		fields: [reviewMedia.mediaId],
		references: [media.id]
	}),
	review: one(reviews, {
		fields: [reviewMedia.reviewId],
		references: [reviews.id]
	}),
}));