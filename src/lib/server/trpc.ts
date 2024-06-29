import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "@/lib/trpc/context";
import superjson from "superjson";
import { ZodError } from "zod";
import { accounts } from "../db/drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof ZodError ? error.cause.flatten() : null,
			},
		};
	},
});
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

export const userProcedure = t.procedure.use(async ({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Unauthorized",
		});
	}

	return next({ ctx: { ...ctx, user: ctx.user } });
});

export const accountProcedure = userProcedure.use(async ({ ctx, next }) => {
	const [account] = await ctx.db
		.select()
		.from(accounts)
		.where(eq(accounts.userId, ctx.user.id));

	if (!account) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Account not found",
		});
	}
	return next({ ctx: { ...ctx, account: account } });
});

export const companyOwnerProcedure = accountProcedure.use(
	async ({ ctx, next }) => {
		const activeOwnedCompanies = ctx.ownedCompanies?.filter(
			(company) => company.deletedAt === null
		);

		if (!activeOwnedCompanies) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You are not the owner of any companies",
			});
		}

		return next({ ctx: { ...ctx, ownedCompanies: activeOwnedCompanies } });
	}
);
