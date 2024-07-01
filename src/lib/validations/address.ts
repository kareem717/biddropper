import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { addresses } from "../db/drizzle/schema";

export type NewAddress = z.infer<typeof NewAddressSchema>;
export const NewAddressSchema = createInsertSchema(addresses).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export type ShowAddress = z.infer<typeof ShowAddressSchema>;
export const ShowAddressSchema = createSelectSchema(addresses);
