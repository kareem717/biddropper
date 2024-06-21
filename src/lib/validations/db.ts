import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
	accounts,
	companies,
	industries,
	addresses,
} from "@/lib/db/drizzle/schema";
import { z } from "zod";

export const accountInsertSchema = createInsertSchema(accounts, {
	username: z.string().min(3).max(60),
	description: z.string().max(255),
}).omit({
	id: true,
	created_at: true,
	updated_at: true,
	deleted_at: true,
});

export const accountSelectSchema = createSelectSchema(accounts);

export const companyInsertSchema = createInsertSchema(companies, {
	name: z.string().min(3).max(60),
}).omit({
	id: true,
	created_at: true,
	updated_at: true,
	deleted_at: true,
	is_verified: true,
	is_active: true,
	image_id: true,
	address_id: true,
});
export const companySelectSchema = createSelectSchema(companies);

export const industryInsertSchema = createInsertSchema(industries, {
	name: z.string().min(3).max(60),
}).omit({
	id: true,
	created_at: true,
	updated_at: true,
	deleted_at: true,
});
export const industrySelectSchema = createSelectSchema(industries);

export const addressInsertSchema = createInsertSchema(addresses).omit({
	id: true,
	created_at: true,
	updated_at: true,
	deleted_at: true,
});
export const addressSelectSchema = createSelectSchema(addresses);