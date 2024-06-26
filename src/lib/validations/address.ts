import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { addresses } from "../db/drizzle/schema";

export const NewAddressSchema = createInsertSchema(addresses).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export const ShowAddressSchema = createSelectSchema(addresses);
