import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { messages } from "../db/drizzle/schema";

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
	});

export type ShowMessage = z.infer<typeof ShowMessageSchema>;
export const ShowMessageSchema = createSelectSchema(messages);
