import { Context } from "@/lib/trpc/context";
import {
	NewNotification,
	NewNotificationSchema,
} from "@/lib/validations/notification";
import { notifications } from "@/lib/db/drizzle/schema";

export const createNotification = async (
	input: NewNotification,
	ctx: Context
) => {
	const res = NewNotificationSchema.safeParse(input);
	if (!res.success) {
		throw new Error(res.error.message);
	}

	await ctx.db.insert(notifications).values({
		...res.data,
	});
};
