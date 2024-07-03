import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
	jobs,
	companies,
	jobIndustries,
	companyIndustries,
	accounts,
	industries,
} from "./drizzle/schema";

export type Job = InferSelectModel<typeof jobs>;
export type NewJob = InferInsertModel<typeof jobs>;

export type JobIndustry = InferSelectModel<typeof jobIndustries>;
export type NewJobIndustry = InferInsertModel<typeof jobIndustries>;

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

export type Industry = InferSelectModel<typeof industries>;
export type NewIndustry = InferInsertModel<typeof industries>;

export type Company = InferSelectModel<typeof companies>;
export type NewCompany = InferInsertModel<typeof companies>;

export type CompanyIndustry = InferSelectModel<typeof companyIndustries>;
export type NewCompanyIndustry = InferInsertModel<typeof companyIndustries>;
