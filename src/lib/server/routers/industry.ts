import { publicProcedure, router } from "@/lib/server/trpc";
import IndustryQueryClient from "@/lib/db/queries/industry";
import { TRPCError } from "@trpc/server";

export const industryRouter = router({
	getIndustries: publicProcedure.query(async ({ ctx }) => {
		try {
			return await IndustryQueryClient.GetDetailedMany();
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "An error occurred while fetching industries",
				cause: error,
			});
		}
	}),
});
