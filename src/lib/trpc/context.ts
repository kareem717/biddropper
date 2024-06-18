import { db } from "@/lib/db/index";
import { createServerClient } from "@/lib/supabase/server";

export async function createTRPCContext(opts: { headers: Headers }) {
	const supabase = createServerClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	return {
		db,
		user,
		...opts,
	};
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
