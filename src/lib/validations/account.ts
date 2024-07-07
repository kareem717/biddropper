import { createInsertSchema } from "drizzle-zod";
import { accounts } from "@/lib/db/drizzle/schema";

export const NewAccountSchema = createInsertSchema(accounts).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	englishSearchVector: true,
});

export const EditAccountSchema = createInsertSchema(accounts).omit({
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	englishSearchVector: true,
});
