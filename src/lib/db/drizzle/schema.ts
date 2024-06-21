import {
	pgTable,
	pgSchema,
	pgEnum,
	uuid,
	text,
	timestamp,
	varchar,
	boolean,
	numeric,
	date,
	jsonb,
	serial,
	bigint,
	primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const aal_level = pgEnum("aal_level", ["aal1", "aal2", "aal3"]);
export const code_challenge_method = pgEnum("code_challenge_method", [
	"s256",
	"plain",
]);
export const factor_status = pgEnum("factor_status", [
	"unverified",
	"verified",
]);
export const factor_type = pgEnum("factor_type", ["totp", "webauthn"]);
export const one_time_token_type = pgEnum("one_time_token_type", [
	"confirmation_token",
	"reauthentication_token",
	"recovery_token",
	"email_change_token_new",
	"email_change_token_current",
	"phone_change_token",
]);
export const key_status = pgEnum("key_status", [
	"default",
	"valid",
	"invalid",
	"expired",
]);
export const key_type = pgEnum("key_type", [
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
export const bid_status = pgEnum("bid_status", [
	"pending",
	"accepted",
	"rejected",
	"withdrawn",
]);
export const enum_jobs_property_type = pgEnum("enum_jobs_property_type", [
	"detached",
	"apartment",
	"semi-detached",
]);
export const start_date_flag = pgEnum("start_date_flag", [
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
export const equality_op = pgEnum("equality_op", [
	"eq",
	"neq",
	"lt",
	"lte",
	"gt",
	"gte",
	"in",
]);

const authSchema = pgSchema("auth");

const users = authSchema.table("users", {
	id: uuid("id").primaryKey(),
});

export const accounts = pgTable("accounts", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	user_id: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
	username: text("username").notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
	description: text("description"),
});

export const industries = pgTable("industries", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const account_subscriptions = pgTable("account_subscriptions", {
	account_id: uuid("account_id")
		.primaryKey()
		.notNull()
		.references(() => accounts.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
	stripe_customer_id: varchar("stripe_customer_id", { length: 255 }).notNull(),
	stripe_subscription_id: varchar("stripe_subscription_id", {
		length: 255,
	}).notNull(),
	stripe_price_id: varchar("stripe_price_id", { length: 255 }).notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const jobs = pgTable("jobs", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	is_active: boolean("is_active").default(true).notNull(),
	is_commercial_property: boolean("is_commercial_property")
		.default(false)
		.notNull(),
	description: varchar("description", { length: 3000 }).notNull(),
	start_date: timestamp("start_date", {
		withTimezone: true,
		mode: "string",
	}).notNull(),
	end_date: timestamp("end_date", { withTimezone: true, mode: "string" }),
	start_date_flag: start_date_flag("start_date_flag").default("none").notNull(),
	property_type: enum_jobs_property_type("property_type").notNull(),
	address_id: uuid("address_id")
		.notNull()
		.references(() => addresses.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
	title: varchar("title", { length: 100 }).notNull(),
	tags: varchar("tags").array(),
	created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const companies = pgTable("companies", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: varchar("name", { length: 50 }).notNull(),
	owner_id: uuid("owner_id")
		.notNull()
		.references(() => accounts.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
	address_id: uuid("address_id")
		.notNull()
		.references(() => addresses.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
	service_area: numeric("service_area", { precision: 7, scale: 3 }),
	email_address: varchar("email_address", { length: 320 }).notNull(),
	phone_number: varchar("phone_number", { length: 20 }).notNull(),
	website_url: text("website_url"),
	is_verified: boolean("is_verified").default(false).notNull(),
	date_founded: date("date_founded").notNull(),
	is_active: boolean("is_active").default(true).notNull(),
	tags: varchar("tags").array(),
	created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
	image_id: uuid("image_id").references(() => media.id, {
		onDelete: "restrict",
		onUpdate: "cascade",
	}),
});

export const contracts = pgTable("contracts", {
	id: uuid("id").primaryKey().notNull(),
	is_active: boolean("is_active").default(true).notNull(),
	title: varchar("title", { length: 100 }).notNull(),
	description: varchar("description", { length: 3000 }).notNull(),
	price: numeric("price", { precision: 10, scale: 2 }).notNull(),
	price_currency: varchar("price_currency", { length: 3 }).notNull(),
	expiry_date: timestamp("expiry_date", { withTimezone: true, mode: "string" }),
	company_id: uuid("company_id")
		.notNull()
		.references(() => companies.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
	tags: varchar("tags").default("{}").array().notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const media = pgTable("media", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	url: text("url").notNull(),
	type: text("type").notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const projects = pgTable("projects", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	title: varchar("title", { length: 100 }).notNull(),
	description: text("description").notNull(),
	company_id: uuid("company_id")
		.notNull()
		.references(() => companies.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
	is_active: boolean("is_active").default(true).notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const bids = pgTable("bids", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	price: numeric("price", { precision: 10, scale: 2 }).notNull(),
	sender_company_id: uuid("sender_company_id")
		.notNull()
		.references(() => companies.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
	is_active: boolean("is_active").default(true).notNull(),
	status: bid_status("status").default("pending").notNull(),
	note: varchar("note", { length: 1200 }),
	created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const reviews = pgTable("reviews", {
	id: uuid("id").primaryKey().notNull(),
	author_id: uuid("author_id")
		.notNull()
		.references(() => accounts.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
	rating: numeric("rating", { precision: 2, scale: 1 }).notNull(),
	description: text("description").notNull(),
	title: varchar("title", { length: 100 }).notNull(),
	company_id: uuid("company_id")
		.notNull()
		.references(() => companies.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
	is_active: boolean("is_active").default(true).notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
});

export const addresses = pgTable("addresses", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	x_coordinate: numeric("x_coordinate").notNull(),
	y_coordinate: numeric("y_coordinate").notNull(),
	line_1: varchar("line_1", { length: 70 }),
	line_2: varchar("line_2", { length: 70 }),
	city: varchar("city", { length: 50 }),
	region: varchar("region", { length: 50 }),
	postal_code: varchar("postal_code", { length: 10 }).notNull(),
	country: varchar("country", { length: 60 }).notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
		.default(sql`clock_timestamp()`)
		.notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
	raw_json: jsonb("raw_json"),
	district: text("district"),
	region_code: text("region_code"),
});

export const goose_db_version = pgTable("goose_db_version", {
	id: serial("id").primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	version_id: bigint("version_id", { mode: "number" }).notNull(),
	is_applied: boolean("is_applied").notNull(),
	tstamp: timestamp("tstamp", { mode: "string" }).defaultNow(),
});

export const contract_jobs = pgTable(
	"contract_jobs",
	{
		job_id: uuid("job_id")
			.notNull()
			.references(() => jobs.id, { onDelete: "restrict", onUpdate: "cascade" }),
		contract_id: uuid("contract_id")
			.notNull()
			.references(() => contracts.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
	},
	(table) => {
		return {
			contract_jobs_pkey: primaryKey({
				columns: [table.job_id, table.contract_id],
				name: "contract_jobs_pkey",
			}),
		};
	}
);

export const user_jobs = pgTable(
	"user_jobs",
	{
		job_id: uuid("job_id")
			.notNull()
			.references(() => jobs.id, { onDelete: "restrict", onUpdate: "cascade" }),
		user_id: uuid("user_id")
			.notNull()
			.references(() => accounts.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
	},
	(table) => {
		return {
			user_jobs_pkey: primaryKey({
				columns: [table.job_id, table.user_id],
				name: "user_jobs_pkey",
			}),
		};
	}
);

export const company_jobs = pgTable(
	"company_jobs",
	{
		job_id: uuid("job_id")
			.notNull()
			.references(() => jobs.id, { onDelete: "restrict", onUpdate: "cascade" }),
		company_id: uuid("company_id")
			.notNull()
			.references(() => companies.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
	},
	(table) => {
		return {
			company_jobs_pkey: primaryKey({
				columns: [table.job_id, table.company_id],
				name: "company_jobs_pkey",
			}),
		};
	}
);

export const contract_bids = pgTable(
	"contract_bids",
	{
		contract_id: uuid("contract_id")
			.notNull()
			.references(() => contracts.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		bid_id: uuid("bid_id")
			.notNull()
			.references(() => bids.id, { onDelete: "restrict", onUpdate: "cascade" }),
	},
	(table) => {
		return {
			contract_bids_pkey: primaryKey({
				columns: [table.contract_id, table.bid_id],
				name: "contract_bids_pkey",
			}),
		};
	}
);

export const job_bids = pgTable(
	"job_bids",
	{
		job_id: uuid("job_id")
			.notNull()
			.references(() => jobs.id, { onDelete: "restrict", onUpdate: "cascade" }),
		bid_id: uuid("bid_id")
			.notNull()
			.references(() => bids.id, { onDelete: "restrict", onUpdate: "cascade" }),
	},
	(table) => {
		return {
			job_bids_pkey: primaryKey({
				columns: [table.job_id, table.bid_id],
				name: "job_bids_pkey",
			}),
		};
	}
);

export const company_industries = pgTable(
	"company_industries",
	{
		company_id: uuid("company_id")
			.notNull()
			.references(() => companies.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		industry_id: uuid("industry_id")
			.notNull()
			.references(() => industries.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
	},
	(table) => {
		return {
			company_industries_pkey: primaryKey({
				columns: [table.company_id, table.industry_id],
				name: "company_industries_pkey",
			}),
		};
	}
);

export const job_industries = pgTable(
	"job_industries",
	{
		job_id: uuid("job_id")
			.notNull()
			.references(() => jobs.id, { onDelete: "restrict", onUpdate: "cascade" }),
		industry_id: uuid("industry_id")
			.notNull()
			.references(() => industries.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
	},
	(table) => {
		return {
			job_industries_pkey: primaryKey({
				columns: [table.job_id, table.industry_id],
				name: "job_industries_pkey",
			}),
		};
	}
);

export const job_media = pgTable(
	"job_media",
	{
		media_id: uuid("media_id")
			.notNull()
			.references(() => media.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		job_id: uuid("job_id")
			.notNull()
			.references(() => jobs.id, { onDelete: "restrict", onUpdate: "cascade" }),
		created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
			.default(sql`clock_timestamp()`)
			.notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
		deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
	},
	(table) => {
		return {
			job_media_pkey: primaryKey({
				columns: [table.media_id, table.job_id],
				name: "job_media_pkey",
			}),
		};
	}
);

export const project_media = pgTable(
	"project_media",
	{
		media_id: uuid("media_id")
			.notNull()
			.references(() => media.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		project_id: uuid("project_id")
			.notNull()
			.references(() => projects.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
			.default(sql`clock_timestamp()`)
			.notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
		deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
	},
	(table) => {
		return {
			project_media_pkey: primaryKey({
				columns: [table.media_id, table.project_id],
				name: "project_media_pkey",
			}),
		};
	}
);

export const review_media = pgTable(
	"review_media",
	{
		media_id: uuid("media_id")
			.notNull()
			.references(() => media.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		review_id: uuid("review_id")
			.notNull()
			.references(() => reviews.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
			.default(sql`clock_timestamp()`)
			.notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }),
		deleted_at: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
	},
	(table) => {
		return {
			review_media_pkey: primaryKey({
				columns: [table.media_id, table.review_id],
				name: "review_media_pkey",
			}),
		};
	}
);
