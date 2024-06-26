import { createInsertSchema } from "drizzle-zod";
import { companies } from "@/lib/db/drizzle/schema";
import { z } from "zod";
import { addressInsertSchema, industrySelectSchema } from "./db";

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
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
		imageId: true,
		addressId: true,
	});

export type EditCompany = z.infer<typeof EditCompanySchema>;
export const EditCompanySchema = createInsertSchema(companies, {
	id: z.string().uuid(),
	name: z.string().min(3).max(60),
	tags: z.array(z.string().min(3).max(40)).max(10).optional(),
})
	.extend({
		address: addressInsertSchema,
		industries: industrySelectSchema.array(),
	})
	.omit({
		createdAt: true,
		updatedAt: true,
		isVerified: true,
		isActive: true,
		deletedAt: true,
	});
