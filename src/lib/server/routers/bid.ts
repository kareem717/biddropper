import { bids, job_bids } from "@/lib/db/drizzle/schema";
import { router, companyOwnerProcedure } from "../trpc";
import { NewBidSchema } from "@/lib/validations/bid";
import { TRPCError } from "@trpc/server";

export const bidRouter = router({
	createBid: companyOwnerProcedure
		.input(NewBidSchema)
		.mutation(async ({ ctx, input }) => {
			const { job_id, ...bid } = input;
			const newId = await ctx.db.transaction(async (tx) => {
				if (
					!ctx.ownedCompanies.map((c) => c.id).includes(bid.sender_company_id)
				) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You are not the owner of the bidding company",
					});
				}
				const [newbid] = await tx
					.insert(bids)
					.values({
						...bid,
						price: bid.price.toString(), // Convert price to string
					})
					.returning({ id: bids.id });

				await tx.insert(job_bids).values({
					job_id,
					bid_id: newbid.id,
				});

				return newbid.id;
			});

			return newId;
		}),
});
