import { authRouter } from "./auth";
import { router } from "@/lib/server/trpc";
import { accountRouter } from "./account";
import { industryRouter } from "./industry";
import { companyRouter } from "./company";
import { jobRouter } from "./job";

export const appRouter = router({
	auth: authRouter,
	account: accountRouter,
	industry: industryRouter,
	company: companyRouter,
	job: jobRouter,
});

export type AppRouter = typeof appRouter;
