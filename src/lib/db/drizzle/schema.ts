import {
	pgTable,
	pgEnum,
	uuid,
	timestamp,
	serial,
	bigint,
	boolean,
	varchar,
	numeric,
	index,
	jsonb,
	text,
	date,
	primaryKey,
	pgSchema,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { tsvector } from "./customTypes";

export const aalLevel = pgEnum("aal_level", ["aal1", "aal2", "aal3"]);
export const codeChallengeMethod = pgEnum("code_challenge_method", [
	"s256",
	"plain",
]);
export const factorStatus = pgEnum("factor_status", ["unverified", "verified"]);
export const factorType = pgEnum("factor_type", ["totp", "webauthn"]);
export const oneTimeTokenType = pgEnum("one_time_token_type", [
	"confirmation_token",
	"reauthentication_token",
	"recovery_token",
	"email_change_token_new",
	"email_change_token_current",
	"phone_change_token",
]);
export const keyStatus = pgEnum("key_status", [
	"default",
	"valid",
	"invalid",
	"expired",
]);
export const keyType = pgEnum("key_type", [
	"aead-ietf",
	"aead-det",
	"hmacsha512",
	"hmacsha256",
	"auth",
	"shorthash",
	"generichash",
	"kdf",
	"secretbox",
	"secretstream",
	"stream_xchacha20",
]);
export const bidStatus = pgEnum("bid_status", [
	"pending",
	"accepted",
	"rejected",
	"withdrawn",
]);
export const enumJobsPropertyType = pgEnum("enum_jobs_property_type", [
	"detached",
	"apartment",
	"semi-detached",
]);
export const startDateFlag = pgEnum("start_date_flag", [
	"urgent",
	"flexible",
	"none",
]);
export const action = pgEnum("action", [
	"INSERT",
	"UPDATE",
	"DELETE",
	"TRUNCATE",
	"ERROR",
]);
export const equalityOp = pgEnum("equality_op", [
	"eq",
	"neq",
	"lt",
	"lte",
	"gt",
	"gte",
	"in",
]);

const authSchema = pgSchema("auth");

export const usersInAuth = authSchema.table("users", {
	id: uuid("id").primaryKey(),
});

export const jobRecommendationHistory = pgTable("job_recommendation_history", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	accountId: uuid("account_id")
		.notNull()
		.references(() => accounts.id),
	jobId: uuid("job_id")
		.notNull()
		.references(() => jobs.id),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const accountJobFavourites = pgTable("account_job_favourites", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	accountId: uuid("account_id")
		.notNull()
		.references(() => accounts.id),
	jobId: uuid("job_id")
		.notNull()
		.references(() => jobs.id),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const gooseDbVersion = pgTable("goose_db_version", {
	id: serial("id").primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	versionId: bigint("version_id", { mode: "number" }).notNull(),
	isApplied: boolean("is_applied").notNull(),
	tstamp: timestamp("tstamp", { mode: "string" }).defaultNow(),
});

export const companyAnalytics = pgTable("company_analytics", {
	companyId: uuid("company_id")
		.primaryKey()
		.notNull()
		.references(() => companies.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	monthlyProfileViews: bigint("monthly_profile_views", { mode: "number" })
		.default(0)
		.notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	monthlyBidsReceived: bigint("monthly_bids_received", { mode: "number" })
		.default(0)
		.notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const accountViewHistories = pgTable("account_view_histories", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	accountId: uuid("account_id")
		.notNull()
		.references(() => accounts.id),
	jobId: uuid("job_id").references(() => jobs.id),
	companyId: uuid("company_id").references(() => companies.id),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const industries = pgTable("industries", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const bids = pgTable("bids", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).notNull(),
	senderCompanyId: uuid("sender_company_id")
		.notNull()
		.references(() => companies.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
	isActive: boolean("is_active").default(true).notNull(),
	status: bidStatus("status").default("pending").notNull(),
	note: varchar("note", { length: 100 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const jobs = pgTable(
	"jobs",
	{
		id: uuid("id").defaultRandom().primaryKey().notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		isCommercialProperty: boolean("is_commercial_property")
			.default(false)
			.notNull(),
		description: varchar("description", { length: 3000 }).notNull(),
		startDate: timestamp("start_date", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		endDate: timestamp("end_date", { withTimezone: true, mode: "string" }),
		startDateFlag: startDateFlag("start_date_flag").default("none").notNull(),
		propertyType: enumJobsPropertyType("property_type").notNull(),
		addressId: uuid("address_id")
			.notNull()
			.references(() => addresses.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		title: varchar("title", { length: 100 }).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.default(sql`clock_timestamp()`)
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
		deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),

		englishSearchVector: tsvector("english_search_vector"),
	},
	(table) => {
		return {
			englishSearchVectorIdx: index("jobs_english_search_vector_idx").using(
				"gin",
				table.englishSearchVector
			),
		};
	}
);

export const messageCompanyRecipients = pgTable("message_company_recipients", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	messageId: uuid("message_id")
		.notNull()
		.references(() => messages.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
	companyId: uuid("company_id")
		.notNull()
		.references(() => companies.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
	readAt: timestamp("read_at", { withTimezone: true, mode: "string" }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const addresses = pgTable("addresses", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	xCoordinate: numeric("x_coordinate").notNull(),
	yCoordinate: numeric("y_coordinate").notNull(),
	line1: varchar("line_1", { length: 70 }),
	line2: varchar("line_2", { length: 70 }),
	city: varchar("city", { length: 50 }),
	region: varchar("region", { length: 50 }),
	postalCode: varchar("postal_code", { length: 10 }).notNull(),
	country: varchar("country", { length: 60 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
	rawJson: jsonb("raw_json"),
	district: text("district"),
	regionCode: text("region_code"),
	fullAddress: text("full_address").notNull(),
});

export const messageAccountRecipients = pgTable("message_account_recipients", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	messageId: uuid("message_id")
		.notNull()
		.references(() => messages.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
	accountId: uuid("account_id")
		.notNull()
		.references(() => accounts.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
	readAt: timestamp("read_at", { withTimezone: true, mode: "string" }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const messageThread = pgTable("message_thread", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	messageId: uuid("message_id").references(() => messages.id, {
		onDelete: "restrict",
		onUpdate: "cascade",
	}),
	createdAt: timestamp("created_at", {
		withTimezone: true,
		mode: "string",
	}).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const messages = pgTable(
	"messages",
	{
		id: uuid("id").defaultRandom().primaryKey().notNull(),
		description: text("description").notNull(),
		title: varchar("title", { length: 100 }).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.default(sql`clock_timestamp()`)
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
		deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
		senderCompanyId: uuid("sender_company_id").references(() => companies.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
		senderAccountId: uuid("sender_account_id").references(() => accounts.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),

		englishSearchVector: tsvector("english_search_vector"),
	},
	(table) => {
		return {
			englishSearchVectorIdx: index("messages_english_search_vector_idx").using(
				"gin",
				table.englishSearchVector
			),
		};
	}
);

export const companies = pgTable(
	"companies",
	{
		id: uuid("id").defaultRandom().primaryKey().notNull(),
		name: varchar("name", { length: 50 }).notNull(),
		ownerId: uuid("owner_id")
			.notNull()
			.references(() => accounts.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		addressId: uuid("address_id")
			.notNull()
			.references(() => addresses.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		serviceArea: numeric("service_area", { precision: 7, scale: 3 }),
		emailAddress: varchar("email_address", { length: 320 }).notNull(),
		phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
		websiteUrl: text("website_url"),
		isVerified: boolean("is_verified").default(false).notNull(),
		dateFounded: date("date_founded").notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.default(sql`clock_timestamp()`)
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
		deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),

		englishSearchVector: tsvector("english_search_vector"),
	},
	(table) => {
		return {
			englishSearchVectorIdx: index(
				"companies_english_search_vector_idx"
			).using("gin", table.englishSearchVector),
		};
	}
);

export const accounts = pgTable(
	"accounts",
	{
		id: uuid("id").defaultRandom().primaryKey().notNull(),
		userId: uuid("user_id")
			.notNull()
			.references(() => usersInAuth.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		username: text("username").notNull(),
		description: text("description"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.default(sql`clock_timestamp()`)
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
		deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),

		englishSearchVector: tsvector("english_search_vector"),
	},
	(table) => {
		return {
			englishSearchVectorIdx: index("accounts_english_search_vector_idx").using(
				"gin",
				table.englishSearchVector
			),
		};
	}
);

export const companyJobs = pgTable(
	"company_jobs",
	{
		jobId: uuid("job_id")
			.notNull()
			.references(() => jobs.id, { onDelete: "restrict", onUpdate: "cascade" }),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companies.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
	},
	(table) => {
		return {
			companyJobsPkey: primaryKey({
				columns: [table.jobId, table.companyId],
				name: "company_jobs_pkey",
			}),
		};
	}
);

export const accountJobs = pgTable(
	"account_jobs",
	{
		jobId: uuid("job_id")
			.notNull()
			.references(() => jobs.id, { onDelete: "restrict", onUpdate: "cascade" }),
		accountId: uuid("account_id")
			.notNull()
			.references(() => accounts.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
	},
	(table) => {
		return {
			accountJobsPkey: primaryKey({
				columns: [table.jobId, table.accountId],
				name: "account_jobs_pkey",
			}),
		};
	}
);

export const jobBids = pgTable(
	"job_bids",
	{
		jobId: uuid("job_id")
			.notNull()
			.references(() => jobs.id, { onDelete: "restrict", onUpdate: "cascade" }),
		bidId: uuid("bid_id")
			.notNull()
			.references(() => bids.id, { onDelete: "restrict", onUpdate: "cascade" }),
	},
	(table) => {
		return {
			jobBidsPkey: primaryKey({
				columns: [table.jobId, table.bidId],
				name: "job_bids_pkey",
			}),
		};
	}
);

export const companyIndustries = pgTable(
	"company_industries",
	{
		companyId: uuid("company_id")
			.notNull()
			.references(() => companies.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		industryId: uuid("industry_id")
			.notNull()
			.references(() => industries.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
	},
	(table) => {
		return {
			companyIndustriesPkey: primaryKey({
				columns: [table.companyId, table.industryId],
				name: "company_industries_pkey",
			}),
		};
	}
);

export const jobIndustries = pgTable(
	"job_industries",
	{
		jobId: uuid("job_id")
			.notNull()
			.references(() => jobs.id, { onDelete: "restrict", onUpdate: "cascade" }),
		industryId: uuid("industry_id")
			.notNull()
			.references(() => industries.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
	},
	(table) => {
		return {
			jobIndustriesPkey: primaryKey({
				columns: [table.jobId, table.industryId],
				name: "job_industries_pkey",
			}),
		};
	}
);
