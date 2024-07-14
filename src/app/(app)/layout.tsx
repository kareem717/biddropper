import { Navbar } from "@/components/app/Navbar";
import { FullSidebar } from "@/components/app/FullSidebar";
import { createClient } from "@/lib/utils/supabase/server";
import { api } from "@/lib/trpc/api";
import { redirect } from "next/navigation";

export default async function AppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = createClient()
	const { data: { user } } = await supabase.auth.getUser()


	if (!user) {
		redirect("/login");
	}

	const account = await api.account.getAccount.query();
	if (!account) {
		redirect("/create-account");
	}

	return (
		<div className="h-full w-full relative">
			<Navbar className="md:px-8 px-4 py-2 border-b fixed bg-background w-full z-50" />
			<div className="overflow-y-auto flex-grow w-full h-full pt-16">
				{children}
			</div>
		</div>
	);
}
