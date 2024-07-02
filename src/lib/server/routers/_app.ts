import { authRouter } from "./auth";
import { router } from "@/lib/server/trpc";
import { accountRouter } from "./account";
import { industryRouter } from "./industry";
import { companyRouter } from "./company";
import { jobRouter } from "./job";
import { bidRouter } from "./bid";
import { notificationRouter } from "./notification";
import { emailRouter } from "./email";

export const appRouter = router({
	auth: authRouter,
	account: accountRouter,
	industry: industryRouter,
	company: companyRouter,
	job: jobRouter,
	bid: bidRouter,
	notification: notificationRouter,
	email: emailRouter,
});

export type AppRouter = typeof appRouter;
