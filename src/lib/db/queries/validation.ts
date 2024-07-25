import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
	accounts,
	addresses,
	bids,
	bidStatus,
	companies,
	industries,
	jobs,
	messageAccountRecipients,
	messageCompanyRecipients,
	messages,
} from "@/lib/db/drizzle/schema";
export type NewAddress = z.infer<typeof NewAddressSchema>;
export const NewAddressSchema = createInsertSchema(addresses).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export type NewIndustry = z.infer<typeof NewIndustrySchema>;
export const NewIndustrySchema = createInsertSchema(industries, {
	name: z.string().min(3).max(60),
}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export type ShowIndustry = z.infer<typeof ShowIndustrySchema>;
export const ShowIndustrySchema = createSelectSchema(industries);

export type ShowAddress = z.infer<typeof ShowAddressSchema>;
export const ShowAddressSchema = createSelectSchema(addresses);

export type NewAccount = z.infer<typeof NewAccountSchema>;
export const NewAccountSchema = createInsertSchema(accounts).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	englishSearchVector: true,
});

export type NewJob = z.infer<typeof NewJobSchema>;
export const NewJobSchema = createInsertSchema(jobs, {
	title: z.string().min(3).max(60),
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

export type NewMessage = z.infer<typeof NewMessageSchema>;
export const NewMessageSchema = createInsertSchema(messages)
	.extend({
		recipients: z.object({
			accountIds: z.array(z.string()).optional().default([]),
			companyIds: z.array(z.string()).optional().default([]),
		}),
	})
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
		englishSearchVector: true,
	});

export type UpdateRecipient = z.infer<typeof UpdateRecipientSchema>;
export const UpdateRecipientSchema = z.object({
	messageId: z.string(),
	readAt: z.string().datetime().nullable().optional(),
	deletedAt: z.string().datetime().nullable().optional(),
	recipient: z.union([
		z.object({
			accountId: z.string(),
		}),
		z.object({
			companyId: z.string(),
		}),
	]),
});

export type ShowMessage = z.infer<typeof ShowMessageSchema>;
export const ShowMessageSchema = createSelectSchema(messages).extend({
	readAt: z.string().datetime().nullable(),
	deletedAt: z.string().datetime().nullable(),
	sender: z.object({
		id: z.string(),
		name: z.string(),
		deletedAt: z.string().datetime().nullable(),
		type: z.enum(["account", "company"]),
	}),
});

export type NewCompany = z.infer<typeof NewCompanySchema>;
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

export type NewBid = z.infer<typeof NewBidSchema>;
export const NewBidSchema = createInsertSchema(bids, {
	priceUsd: z.coerce.number().min(0).max(25000000),
})
	.extend({
		jobId: z.string().uuid(),
	})
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
		isActive: true,
	});

export type EditBid = z.infer<typeof EditBidSchema>;
export const EditBidSchema = createInsertSchema(bids, {
	priceUsd: z.coerce.number().min(0).max(25000000),
}).omit({
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	isActive: true,
});

export type ShowBid = z.infer<typeof ShowBidSchema>;
export const ShowBidSchema = z.object({
	bids: createSelectSchema(bids),
	job: z.object({
		id: z.string().uuid(),
		title: z.string(),
		description: z.string(),
		createdAt: z.string(),
		deletedAt: z.string().nullable(),
	}),
});

export type DetailedBid = z.infer<typeof DetailedBidSchema>;
export const DetailedBidSchema = ShowBidSchema.extend({
	senderCompany: z.object({
		id: z.string().uuid(),
		name: z.string(),
		ownerAccountId: z.string().uuid(),
	}),
	job: z.object({
		id: z.string().uuid(),
		title: z.string(),
		owner: z.union([
			z.object({
				companyId: z.string().uuid(),
				companyName: z.string(),
				ownerAccountId: z.string().uuid(),
			}),
			z.object({
				accountId: z.string().uuid(),
				accountUsername: z.string(),
			}),
		]),
	}),
});

export type BidFilter = z.infer<typeof BidFilterSchema>;
export const BidFilterSchema = z.object({
	statuses: z
		.array(z.enum(bidStatus.enumValues))
		.optional()
		.default([bidStatus.enumValues[0]]), // default to pending
	jobIdFilter: z.string().uuid().optional(),
	senderCompanyIdFilter: z.string().uuid().optional(),
	includeDeleted: z.boolean().optional().default(false),
	minPriceUsd: z.coerce.number().optional(),
	maxPriceUsd: z.coerce.number().optional(),
});

export type JobRecommendation = {
	jobId: string;
	accountId: string;
};

export type CompanyRecommendation = {
	companyId: string;
	accountId: string;
};

export type EditAccount = z.infer<typeof EditAccountSchema>;
export const EditAccountSchema = createInsertSchema(accounts).omit({
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	englishSearchVector: true,
});
