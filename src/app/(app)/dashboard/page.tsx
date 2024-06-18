"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { redirect } from "next/navigation";

export default function Home() {
	const { user } = useAuth();

	return (
		<main>
			<h1 className="font-semibold text-2xl">Home</h1>
			<p className="my-2">
				Wow, that was easy. Now it&apos;s your turn. Building something cool!
			</p>
			<pre>{JSON.stringify(user, null, 2)}</pre>
		</main>
	);
}
