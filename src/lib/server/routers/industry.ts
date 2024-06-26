import { industries } from "@/lib/db/drizzle/schema";
import { publicProcedure, router } from "@/lib/server/trpc";
import { TRPCError } from "@trpc/server";
import { isNull } from "drizzle-orm";

export const industryRouter = router({
	getIndustries: publicProcedure.query(async ({ ctx }) => {
		try {
			const res = await ctx.db
				.select()
				.from(industries)
				.where(isNull(industries.deletedAt));
			return res;
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch industries",
			});
		}
	}),
});
