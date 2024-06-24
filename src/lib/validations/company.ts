import { createInsertSchema } from "drizzle-zod";
import { companies } from "@/lib/db/drizzle/schema";
import { z } from "zod";
import { addressInsertSchema } from "./db";

export const NewCompanySchema = createInsertSchema(companies, {
	name: z.string().min(3).max(60),
	tags: z.array(z.string().min(3).max(40)).max(10).optional(),
})
	.extend({
		address: addressInsertSchema,
		industries: z
			.string({
				invalid_type_error: "Industries must be an array of strings",
				required_error: "Industries are required",
			})
			.uuid({
				message: "Industries must be valid UUIDs",
			})
			.array(),
	})
	.omit({
		id: true,
		created_at: true,
		updated_at: true,
		deleted_at: true,
		is_verified: true,
		is_active: true,
		image_id: true,
		address_id: true,
	});

export const EditCompanySchema = createInsertSchema(companies, {
	name: z.string().min(3).max(60),
	tags: z.array(z.string().min(3).max(40)).max(10).optional(),
})
	.extend({
		address: addressInsertSchema.optional(),
		add_industries: z
			.string({
				invalid_type_error: "Industries must be an array of strings",
				required_error: "Industries are required",
			})
			.uuid({
				message: "Industries must be valid UUIDs",
			})
			.array()
			.optional(),
		remove_industries: z
			.string({
				invalid_type_error: "Industries must be an array of strings",
				required_error: "Industries are required",
			})
			.uuid({
				message: "Industries must be valid UUIDs",
			})
			.array()
			.optional(),
	})
	.omit({
		created_at: true,
		updated_at: true,
		deleted_at: true,
	});
