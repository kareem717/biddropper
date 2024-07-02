import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		DATABASE_URL: z.string().min(1),

		RESEND_API_KEY: z.string().min(1),

		SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
	},
	client: {
		NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
		NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
		NEXT_PUBLIC_APP_URL: z.string().min(1),
		NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: z.string().min(1),
		NEXT_PUBLIC_MAPBOX_STYLE_DARK: z.string().min(1),
		NEXT_PUBLIC_MAPBOX_STYLE_LIGHT: z.string().min(1),
		NEXT_PUBLIC_SUPPORT_EMAIL: z.string().min(1),
		NEXT_PUBLIC_OUTREACH_EMAIL: z.string().min(1),
	},

	experimental__runtimeEnv: {
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
		NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN:
			process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
		NEXT_PUBLIC_MAPBOX_STYLE_DARK: process.env.NEXT_PUBLIC_MAPBOX_STYLE_DARK,
		NEXT_PUBLIC_MAPBOX_STYLE_LIGHT: process.env.NEXT_PUBLIC_MAPBOX_STYLE_LIGHT,
		NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
		NEXT_PUBLIC_OUTREACH_EMAIL: process.env.NEXT_PUBLIC_OUTREACH_EMAIL,
	},
});
