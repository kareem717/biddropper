import { publicProcedure, router } from "@/lib/server/trpc";
import IndustryQueryClient from "@/lib/db/queries/industry";

export const industryRouter = router({
	getIndustries: publicProcedure.query(async ({ ctx }) => {
		return await IndustryQueryClient.GetDetailedMany();
	}),

});
