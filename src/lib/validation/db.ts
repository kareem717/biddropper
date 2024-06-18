import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { accounts } from "@/lib/db/migrations/schema";
import { z } from "zod";

export const accountInsertSchema = createInsertSchema(accounts, {
	username: z.string().min(3).max(60),
	description: z.string().max(255),
});
export const accountSelectSchema = createSelectSchema(accounts);
