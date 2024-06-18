import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TrpcProvider from "@/components/providers/TRPCProvider";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { api } from "@/lib/trpc/api";
import { redirect } from "next/navigation";
import AuthProvider from "@/components/providers/AuthProvider";

export default async function AppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = createServerClient()
	const { data: { user }, error } = await supabase.auth.getUser()


	if (!user) {
		redirect("/login");
	}

	const account = await api.account.getUserAccount.query();

	if (!account) {
		redirect("/create-account");
	}

	return (
		<main>
			<AuthProvider user={user} account={account}>
				<TrpcProvider cookies={cookies().toString()}>
					<div className="flex h-screen">
						<Sidebar />
						<main className="flex-1 md:p-8 pt-2 p-8 overflow-y-auto">
							<Navbar />
							{children}
						</main>
					</div>
				</TrpcProvider>

				<Toaster richColors />
			</AuthProvider>
		</main>
	);
}
