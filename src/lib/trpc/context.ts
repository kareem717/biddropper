import { db } from "@/lib/db/index";
import { createClient } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import { accounts, companies } from "@/lib/db/drizzle/schema";

export async function createTRPCContext(opts: { headers: Headers }) {
	const supabase = createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	let account = null;
	let ownedCompanies = null;

	if (user) {
		[account] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.user_id, user.id));
	}

	if (account) {
		ownedCompanies = await db
			.select({
				id: companies.id,
				name: companies.name,
			})
			.from(companies)
			.where(eq(companies.owner_id, account.id));
	}

	return {
		db,
		user,
		account,
		ownedCompanies,
		...opts,
	};
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
