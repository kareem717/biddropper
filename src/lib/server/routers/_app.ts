import { authRouter } from "./auth";
import { router } from "@/lib/server/trpc";
import { accountRouter } from "./account";

export const appRouter = router({
	auth: authRouter,
	account: accountRouter,
});

export type AppRouter = typeof appRouter;
