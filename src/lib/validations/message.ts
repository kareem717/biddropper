import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { messages } from "../db/drizzle/schema";

export type NewMessage = z.infer<typeof NewMessageSchema>;
export const NewMessageSchema = createInsertSchema(messages).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export type ShowMessage = z.infer<typeof ShowMessageSchema>;
export const ShowMessageSchema = createSelectSchema(messages);
