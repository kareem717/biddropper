"use client";

import { Icons } from "../Icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { createBrowserClient } from "@/lib/supabase/react";
import { useRouter } from "next/navigation";
import { env } from "@/lib/env.mjs";

const LoginForm = () => {
	const supabase = createBrowserClient();
	const router = useRouter();

	const handleLogin = async (provider: "google" | "github") => {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: provider,

			options: {
				redirectTo: `${env.NEXT_PUBLIC_AUTH_URL}/auth/callback`
			}
		});

		if (error) {
			throw error
		} else {
			router.push(data.url)
		}
	};


	return (
		<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div className="flex flex-col space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
				<p className="text-sm text-muted-foreground">Enter your email below to create your account</p>
			</div>
			<form>
				<div className="grid gap-2">
					<div className="grid gap-1">
						<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only" >Email</label>
						<Input type="email" placeholder="name@example.com" />
						<Button >Sign in with Email</Button>
					</div>
				</div>
			</form>
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t"></span>
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">Or continue with</span>
				</div>
			</div>
			<div className="flex justify-center items-center gap-2 md:flex-col">
				<Button className="w-full" variant="secondary" onClick={() => handleLogin("github")}><Icons.github className="w-4 h-4" /></Button>
				<Button className="w-full" variant="secondary" onClick={() => handleLogin("google")}><Icons.google className="w-4 h-4" /></Button>
			</div>
		</div>
	);
};

export default LoginForm;
