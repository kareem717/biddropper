"use client";

import { Icons } from "../Icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { OAuthButtons } from "./OAuthButtons";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
	email: z.string({
		required_error: "Email is required",
		message: "Invalid email address.",
	}).email({
		message: "Invalid email address.",
	}).min(1, {
		message: "Email is required",
	}),
})

export const LoginForm = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);

		const supabase = createClient();
		const { data, error } = await supabase.auth.signInWithOtp({
			email: values.email,
			options: {
				emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
				shouldCreateUser: true,
			},
		})

		if (error) {
			toast.error("Uh oh!", {
				description: "Something went wrong. Please try again.",
			});
		} else {
			toast.success("Check your email", {
				description: "We've sent you a link to login.",
			});
		}

		setIsLoading(false);
	}

	return (
		<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div className="flex flex-col space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">Login</h1>
				<p className="text-sm text-muted-foreground">Enter your email below to login</p>
			</div>
			<form>

			</form>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} >
					<div className="grid gap-2">
						<div className="grid gap-1">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input type="email" placeholder="name@example.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" disabled={isLoading}>
								{
									isLoading ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Sign in with Email"
								}
							</Button>
						</div>
					</div>
				</form>
			</Form>
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t"></span>
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">Or continue with</span>
				</div>
			</div>
			<OAuthButtons providers={["google", "github"]} disabled={isLoading} />
		</div>
	);
};
