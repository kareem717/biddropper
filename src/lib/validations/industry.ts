import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { industries } from "../db/drizzle/schema";

export const NewIndustrySchema = createInsertSchema(industries, {
	name: z.string().min(3).max(60),
}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export const ShowIndustrySchema = createSelectSchema(industries);
