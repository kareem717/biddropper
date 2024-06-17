import { relations } from "drizzle-orm/relations";
import { usersInAuth, accounts, account_subscriptions, addresses, jobs, companies, media, contracts, projects, bids, reviews, media_relationships, contract_jobs, user_jobs, company_jobs, contract_bids, job_bids, company_industries, industries, job_industries } from "./schema";

export const accountsRelations = relations(accounts, ({one, many}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [accounts.user_id],
		references: [usersInAuth.id]
	}),
	account_subscriptions: many(account_subscriptions),
	companies: many(companies),
	reviews: many(reviews),
	user_jobs: many(user_jobs),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	accounts: many(accounts),
}));

export const account_subscriptionsRelations = relations(account_subscriptions, ({one}) => ({
	account: one(accounts, {
		fields: [account_subscriptions.account_id],
		references: [accounts.id]
	}),
}));

export const jobsRelations = relations(jobs, ({one, many}) => ({
	address: one(addresses, {
		fields: [jobs.address_id],
		references: [addresses.id]
	}),
	media_relationships: many(media_relationships),
	contract_jobs: many(contract_jobs),
	user_jobs: many(user_jobs),
	company_jobs: many(company_jobs),
	job_bids: many(job_bids),
	job_industries: many(job_industries),
}));

export const addressesRelations = relations(addresses, ({many}) => ({
	jobs: many(jobs),
	companies: many(companies),
}));

export const companiesRelations = relations(companies, ({one, many}) => ({
	address: one(addresses, {
		fields: [companies.address_id],
		references: [addresses.id]
	}),
	media: one(media, {
		fields: [companies.image_id],
		references: [media.id]
	}),
	account: one(accounts, {
		fields: [companies.owner_id],
		references: [accounts.id]
	}),
	contracts: many(contracts),
	projects: many(projects),
	bids: many(bids),
	reviews: many(reviews),
	company_jobs: many(company_jobs),
	company_industries: many(company_industries),
}));

export const mediaRelations = relations(media, ({many}) => ({
	companies: many(companies),
	media_relationships: many(media_relationships),
}));

export const contractsRelations = relations(contracts, ({one, many}) => ({
	company: one(companies, {
		fields: [contracts.company_id],
		references: [companies.id]
	}),
	contract_jobs: many(contract_jobs),
	contract_bids: many(contract_bids),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	company: one(companies, {
		fields: [projects.company_id],
		references: [companies.id]
	}),
	media_relationships: many(media_relationships),
}));

export const bidsRelations = relations(bids, ({one, many}) => ({
	company: one(companies, {
		fields: [bids.sender_company_id],
		references: [companies.id]
	}),
	contract_bids: many(contract_bids),
	job_bids: many(job_bids),
}));

export const reviewsRelations = relations(reviews, ({one, many}) => ({
	account: one(accounts, {
		fields: [reviews.author_id],
		references: [accounts.id]
	}),
	company: one(companies, {
		fields: [reviews.company_id],
		references: [companies.id]
	}),
	media_relationships: many(media_relationships),
}));

export const media_relationshipsRelations = relations(media_relationships, ({one}) => ({
	job: one(jobs, {
		fields: [media_relationships.job_id],
		references: [jobs.id]
	}),
	media: one(media, {
		fields: [media_relationships.media_id],
		references: [media.id]
	}),
	project: one(projects, {
		fields: [media_relationships.project_id],
		references: [projects.id]
	}),
	review: one(reviews, {
		fields: [media_relationships.review_id],
		references: [reviews.id]
	}),
}));

export const contract_jobsRelations = relations(contract_jobs, ({one}) => ({
	contract: one(contracts, {
		fields: [contract_jobs.contract_id],
		references: [contracts.id]
	}),
	job: one(jobs, {
		fields: [contract_jobs.job_id],
		references: [jobs.id]
	}),
}));

export const user_jobsRelations = relations(user_jobs, ({one}) => ({
	job: one(jobs, {
		fields: [user_jobs.job_id],
		references: [jobs.id]
	}),
	account: one(accounts, {
		fields: [user_jobs.user_id],
		references: [accounts.id]
	}),
}));

export const company_jobsRelations = relations(company_jobs, ({one}) => ({
	company: one(companies, {
		fields: [company_jobs.company_id],
		references: [companies.id]
	}),
	job: one(jobs, {
		fields: [company_jobs.job_id],
		references: [jobs.id]
	}),
}));

export const contract_bidsRelations = relations(contract_bids, ({one}) => ({
	bid: one(bids, {
		fields: [contract_bids.bid_id],
		references: [bids.id]
	}),
	contract: one(contracts, {
		fields: [contract_bids.contract_id],
		references: [contracts.id]
	}),
}));

export const job_bidsRelations = relations(job_bids, ({one}) => ({
	bid: one(bids, {
		fields: [job_bids.bid_id],
		references: [bids.id]
	}),
	job: one(jobs, {
		fields: [job_bids.job_id],
		references: [jobs.id]
	}),
}));

export const company_industriesRelations = relations(company_industries, ({one}) => ({
	company: one(companies, {
		fields: [company_industries.company_id],
		references: [companies.id]
	}),
	industry: one(industries, {
		fields: [company_industries.industry_id],
		references: [industries.id]
	}),
}));

export const industriesRelations = relations(industries, ({many}) => ({
	company_industries: many(company_industries),
	job_industries: many(job_industries),
}));

export const job_industriesRelations = relations(job_industries, ({one}) => ({
	industry: one(industries, {
		fields: [job_industries.industry_id],
		references: [industries.id]
	}),
	job: one(jobs, {
		fields: [job_industries.job_id],
		references: [jobs.id]
	}),
}));