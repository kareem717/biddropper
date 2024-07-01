import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { bidStatus, bids } from "@/lib/db/drizzle/schema";
import { z } from "zod";

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

export const EditBidSchema = createInsertSchema(bids, {
	priceUsd: z.coerce.number().min(0).max(25000000),
}).omit({
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	isActive: true,
});

export type Bid = z.infer<typeof SelectBidSchema>;
export const SelectBidSchema = createSelectSchema(bids);

export type DetailedBid = z.infer<typeof DetailedBidSchema>;
export const DetailedBidSchema = SelectBidSchema.extend({
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
	statuses: z.array(z.enum(bidStatus.enumValues)).optional(),
	minPriceUsd: z.coerce.number().optional(),
	maxPriceUsd: z.coerce.number().optional(),
});
