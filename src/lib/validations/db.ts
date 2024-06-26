import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
	accounts,
	companies,
	industries,
	addresses,
	media,
} from "@/lib/db/drizzle/schema";
import { z } from "zod";

export const accountInsertSchema = createInsertSchema(accounts, {
	username: z.string().min(3).max(60),
	description: z.string().max(255),
}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export const accountSelectSchema = createSelectSchema(accounts);

export const companyInsertSchema = createInsertSchema(companies, {
	name: z.string().min(3).max(60),
}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	isVerified: true,
	isActive: true,
	imageId: true,
	addressId: true,
});
export const companySelectSchema = createSelectSchema(companies);

export const industryInsertSchema = createInsertSchema(industries, {
	name: z.string().min(3).max(60),
}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});
export const industrySelectSchema = createSelectSchema(industries);

export const addressInsertSchema = createInsertSchema(addresses).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export type NewAddress = z.infer<typeof addressInsertSchema>;
export const addressSelectSchema = createSelectSchema(addresses);

export const mediaInsertSchema = createInsertSchema(media).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});
export const mediaSelectSchema = createSelectSchema(media);
