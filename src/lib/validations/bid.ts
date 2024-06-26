import { createInsertSchema } from "drizzle-zod";
import { bids } from "@/lib/db/drizzle/schema";
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
