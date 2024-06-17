import { createClient } from "@/lib/supabase";
import { Provider } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const LoginPage = () => {
	const login = async () => {
		"use server";

		const supabase = createClient();
		const origin = headers().get("origin");

		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${origin}/auth/callback`,
			},
		});

		if (error) {
			console.error(error);
		} else {
			return redirect(data.url);
		}
	};

	return (
		<form action={login}>
			<button type="submit">Login</button>
		</form>
	);
};

export default LoginPage;
