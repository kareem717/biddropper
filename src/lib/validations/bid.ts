import { createInsertSchema } from "drizzle-zod";
import { bids } from "@/lib/db/drizzle/schema";
import { z } from "zod";

export const NewBidSchema = createInsertSchema(bids, {
	price_usd: z.coerce.number().min(0).max(25000000),
})
	.extend({
		job_id: z.string().uuid(),
	})
	.omit({
		id: true,
		created_at: true,
		updated_at: true,
		deleted_at: true,
		is_active: true,
	});
