import { db } from "@/lib/db/index";
import { createClient } from "@/lib/utils/supabase/server";
import AccountQueryClient from "@/lib/db/queries/account";
import CompanyQueryClient from "@/lib/db/queries/company";

export async function createTRPCContext(opts: { headers: Headers }) {
	const supabase = createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	let account = null;
	let ownedCompanies = null;

	if (user) {
		account = await AccountQueryClient.GetDetailedByUserId(user.id);
	}

	if (account) {
		ownedCompanies = await CompanyQueryClient.GetDetailedManyByOwnerId(
			account.id,
			true
		);
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
