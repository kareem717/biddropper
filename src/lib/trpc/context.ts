import { db } from "@/lib/db/index";
import { createClient } from "@/lib/utils/supabase/server";
import { eq, and, isNull } from "drizzle-orm";
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
			.where(and(eq(accounts.userId, user.id), isNull(accounts.deletedAt)));
	}

	if (account) {
		ownedCompanies = await db
			.select()
			.from(companies)
			.where(eq(companies.ownerId, account.id));
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
