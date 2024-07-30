import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/utils/supabase/server";
import { api } from "@/lib/trpc/api";
import { cookies } from "next/headers";
import TrpcProvider from "@/components/providers/TRPCProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "biddropper",
	description: "biddropper",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {

	let user = null;
	let account = null;

	const supabase = createClient();
	const { data } = await supabase.auth.getUser();
	user = data.user;

	if (user) {
		account = await api.account.getAccountByUserId.query({
			userId: user.id,
		});
	}

	return (
		<html lang="en">
			<body className={cn(inter.className, "h-screen w-screen")}>
				<AuthProvider user={user} account={account}>
					<TrpcProvider cookies={cookies().toString()}>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							<TooltipProvider>
								{children}
							</TooltipProvider>
						</ThemeProvider>
						<Toaster richColors />
					</TrpcProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
