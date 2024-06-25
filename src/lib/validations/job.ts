import { createInsertSchema } from "drizzle-zod";
import { jobs } from "@/lib/db/drizzle/schema";
import { z } from "zod";
import { addressInsertSchema, industrySelectSchema } from "./db";

export const NewJobSchema = createInsertSchema(jobs, {
	title: z.string().min(3).max(60),
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
		company_id: z.string().uuid().optional(),
		account_id: z.string().uuid().optional(),
	})
	.omit({
		id: true,
		created_at: true,
		updated_at: true,
		deleted_at: true,
		is_active: true,
		address_id: true,
	});

export type EditJob = z.infer<typeof EditJobSchema>;
export const EditJobSchema = createInsertSchema(jobs, {
	title: z.string().min(3).max(60),
	tags: z.array(z.string().min(3).max(40)).max(10).optional(),
})
	.extend({
		address: addressInsertSchema,
		industries: industrySelectSchema.array(),
	})
	.omit({
		created_at: true,
		updated_at: true,
		deleted_at: true,
	});
