"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { NewAccountSchema } from "@/lib/validations/account";
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
import { toast } from "sonner"
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { Icons } from "../Icons";
import { useAuth } from "@/components/providers/AuthProvider";
import { Textarea } from "../ui/textarea";

export const CreateAccountForm = () => {
	const { user } = useAuth();
	const router = useRouter();

	if (!user) {
		throw new Error("User not found");
	}

	const { mutateAsync: createAccount, isLoading: isCreatingAccount } = trpc.account.createAccount.useMutation({
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

	const form = useForm<z.infer<typeof NewAccountSchema>>({
		resolver: zodResolver(NewAccountSchema),
		defaultValues: {
			userId: user.id,
			description: "",
			username: "",
		},
	});

	async function onSubmit(values: z.infer<typeof NewAccountSchema>) {
		await createAccount(values);
	}

	return (

		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input placeholder="jimmy77" {...field} />
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
								<Textarea placeholder="I'm a contractor" {...field} value={field.value || ''} />
							</FormControl>
							<FormDescription>
								This is your public display name.
							</FormDescription>
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
