"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { accountInsertSchema } from "@/lib/validation/db";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { Icons } from "../Icons";
import { useAuth } from "@/components/providers/AuthProvider";

export const CreateAccountForm = () => {
	const { user } = useAuth();
	const router = useRouter();
	const { mutate: createAccount, isLoading: isCreatingAccount } = trpc.account.createUserAccount.useMutation({
		onError: () => {
			toast.error("Something went wrong!", {
				description: "Please try again later."
			});
		},
		onSuccess: () => {
			toast.success("Account created");
			router.push("/dashboard");
		},
	});

	const form = useForm<z.infer<typeof accountInsertSchema>>({
		resolver: zodResolver(accountInsertSchema),
		defaultValues: {
			user_id: user?.id,
		},
	});

	function onSubmit(values: z.infer<typeof accountInsertSchema>) {
		createAccount(values);
	}

	return (

		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>user_name</FormLabel>
							<FormControl>
								<Input placeholder="johnDaContractor" {...field} />
							</FormControl>
							<FormDescription>
								This is your public display name.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea {...field} value={field.value || ""} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={isCreatingAccount} className="w-full flex justify-center items-center">
					{isCreatingAccount ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Create account"}
				</Button>
			</form>
		</Form>
	);
};
