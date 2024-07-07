import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { companies } from "@/lib/db/drizzle/schema";
import { z } from "zod";
import { NewAddressSchema } from "./address";
import { ShowIndustrySchema } from "./industry";

export const NewCompanySchema = createInsertSchema(companies, {
	name: z.string().min(3).max(60),
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
	})
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
		addressId: true,
		englishSearchVector: true,
	});

export type EditCompany = z.infer<typeof EditCompanySchema>;
export const EditCompanySchema = createInsertSchema(companies, {
	id: z.string().uuid(),
	name: z.string().min(3).max(60),
})
	.extend({
		address: NewAddressSchema,
		industries: ShowIndustrySchema.array(),
	})
	.omit({
		createdAt: true,
		updatedAt: true,
		isVerified: true,
		isActive: true,
		deletedAt: true,
		englishSearchVector: true,
	});

export type ShowCompany = z.infer<typeof ShowCompanySchema>;
export const ShowCompanySchema = createSelectSchema(companies);
