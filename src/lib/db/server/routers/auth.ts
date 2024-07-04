import { publicProcedure, router } from "@/lib/db/server/trpc";

export const authRouter = router({
	getUser: publicProcedure.query(async (ctx) => {
		return ctx.ctx.user;
	}),
});
