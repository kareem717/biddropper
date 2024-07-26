import { authRouter } from "./auth";
import { router } from "@/lib/server/trpc";
import { accountRouter } from "./account";
import { industryRouter } from "./industry";
import { companyRouter } from "./company";
import { jobRouter } from "./job";
import { bidRouter } from "./bid";
import { messageRouter } from "./message";
import { emailRouter } from "./email";
import { analyticsRouter } from "./analytics";

export const appRouter = router({
	auth: authRouter,
	account: accountRouter,
	industry: industryRouter,
	company: companyRouter,
	job: jobRouter,
	bid: bidRouter,
	message: messageRouter,
	email: emailRouter,
	analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
