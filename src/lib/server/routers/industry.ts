import { publicProcedure, router } from "@/lib/server/trpc";
import IndustryQueryClient from "@/lib/db/queries/industry";

export const industryRouter = router({
	getIndustries: publicProcedure.query(async ({ ctx }) => {
		const industryQueryClient = new IndustryQueryClient(ctx.db);
		return await industryQueryClient.GetDetailedMany();
	}),
});
