import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { notifications } from "../db/drizzle/schema";

export const NewNotificationSchema = createInsertSchema(notifications).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export const ShowNotificationSchema = createSelectSchema(notifications);
