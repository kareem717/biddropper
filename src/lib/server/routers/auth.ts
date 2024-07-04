import { publicProcedure, router } from "@/lib/server/trpc";

export const authRouter = router({
	getUser: publicProcedure.query(async (ctx) => {
		return ctx.ctx.user;
	}),
});
