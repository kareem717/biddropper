import { createInsertSchema } from "drizzle-zod";
import { jobs } from "@/lib/db/drizzle/schema";
import { z } from "zod";
import { NewAddressSchema } from "./address";
import { ShowIndustrySchema } from "./industry";

export const NewJobSchema = createInsertSchema(jobs, {
	title: z.string().min(3).max(60),
	tags: z.array(z.string().min(3).max(40)).max(10).optional(),
})
	.extend({
		address: NewAddressSchema,
		industries: z
			.string({
				invalid_type_error: "Industries must be an array of strings",
				required_error: "Industries are required",
			})
			.uuid({
				message: "Industries must be valid UUIDs",
			})
			.array(),
		companyId: z.string().uuid().optional(),
		accountId: z.string().uuid().optional(),
	})
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
		isActive: true,
		addressId: true,
		englishSearchVector: true,
	});

export type EditJob = z.infer<typeof EditJobSchema>;
export const EditJobSchema = createInsertSchema(jobs, {
	id: z.string().uuid(),
	title: z.string().min(3).max(60),
	tags: z.array(z.string().min(3).max(40)).max(10).optional(),
})
	.extend({
		address: NewAddressSchema,
		industries: ShowIndustrySchema.array(),
	})
	.omit({
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
		isActive: true,
		englishSearchVector: true,
	});
