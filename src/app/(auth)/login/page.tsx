"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const router = useRouter();
	const { user, account } = useAuth();

	if (user && account) {
		router.push("/dashboard");
	}

	if (user && !account) {
		router.push("/create-account");
	}

	return (
		<div className="mx-auto w-full max-w-[350px]">
			<LoginForm />
		</div>
	);
}
