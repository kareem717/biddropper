import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";
import TrpcProvider from "@/components/providers/TRPCProvider";
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
	return (
		<html lang="en">
			<body className={cn(inter.className, "h-screen w-screen")}>
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
			</body>
		</html>
	);
}
