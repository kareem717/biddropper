import { db } from "@/lib/db/index";
import { createClient } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import { accounts } from "@/lib/db/drizzle/schema";

export async function createTRPCContext(opts: { headers: Headers }) {
	const supabase = createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	let account = null;
	if (user) {
		[account] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.user_id, user.id));
	}

	return {
		db,
		user,
		account,
		...opts,
	};
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
