import { Navbar } from "@/components/app/Navbar";
import { FullSidebar } from "@/components/app/FullSidebar";
import { createClient } from "@/utils/supabase/server";
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
		<div className="flex h-full w-full">
			<FullSidebar className="fixed h-full z-10" />
			<div className="flex flex-col w-full md:ml-14">
				<Navbar className="md:px-8 px-4 py-2 border-b " />
				<main className="overflow-y-auto flex-grow md:p-8 p-2">
					{children}
				</main>
			</div>
		</div>
	);
}
