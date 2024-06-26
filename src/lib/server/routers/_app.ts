import { authRouter } from "./auth";
import { router } from "@/lib/server/trpc";
import { accountRouter } from "./account";
import { industryRouter } from "./industry";
import { companyRouter } from "./company";
import { jobRouter } from "./job";
import { bidRouter } from "./bid";
import { notificationRouter } from "./notification";

export const appRouter = router({
	auth: authRouter,
	account: accountRouter,
	industry: industryRouter,
	company: companyRouter,
	job: jobRouter,
	bid: bidRouter,
	notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
