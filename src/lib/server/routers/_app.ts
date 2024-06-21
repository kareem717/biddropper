import { authRouter } from "./auth";
import { router } from "@/lib/server/trpc";
import { accountRouter } from "./account";
import { industryRouter } from "./industry";
import { companyRouter } from "./company";

export const appRouter = router({
	auth: authRouter,
	account: accountRouter,
	industry: industryRouter,
	company: companyRouter,
});

export type AppRouter = typeof appRouter;
