import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
			AWS_ACCESS_KEY: z.string().min(1),
			AWS_SECRET_ACCESS_KEY: z.string().min(1),
			AWS_SES_REGION: z.string().min(1),
	},
	client: {
		NEXT_PUBLIC_APP_URL: z.string().min(1),
		NEXT_PUBLIC_SUPPORT_EMAIL: z.string().min(1),
		NEXT_PUBLIC_SALES_EMAIL: z.string().min(1),
		NEXT_PUBLIC_OUTREACH_EMAIL: z.string().min(1),
	},

	experimental__runtimeEnv: {
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
		NEXT_PUBLIC_SALES_EMAIL: process.env.NEXT_PUBLIC_SALES_EMAIL,
		NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
		NEXT_PUBLIC_OUTREACH_EMAIL: process.env.NEXT_PUBLIC_OUTREACH_EMAIL,
	},
});
