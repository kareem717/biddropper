import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
	jobs,
	companies,
	job_industries,
	company_industries,
	accounts,
	industries,
} from "./drizzle/schema";

export type Job = InferSelectModel<typeof jobs>;
export type NewJob = InferInsertModel<typeof jobs>;

export type JobIndustry = InferSelectModel<typeof job_industries>;
export type NewJobIndustry = InferInsertModel<typeof job_industries>;

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

export type Industry = InferSelectModel<typeof industries>;
export type NewIndustry = InferInsertModel<typeof industries>;

export type Company = InferSelectModel<typeof companies>;
export type NewCompany = InferInsertModel<typeof companies>;

export type CompanyIndustry = InferSelectModel<typeof company_industries>;
export type NewCompanyIndustry = InferInsertModel<typeof company_industries>;
