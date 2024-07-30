import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "@/lib/trpc/context";
import superjson from "superjson";
import { ZodError } from "zod";

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
			message: "You are not logged in.",
			cause: new Error("User not found on context, not signed in"),
		});
	}

	return next({ ctx: { ...ctx, user: ctx.user } });
});

export const accountProcedure = userProcedure.use(async ({ ctx, next }) => {
	if (!ctx.account) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "You need to create a account.",
			cause: new Error("Account not found on context, not signed in"),
		});
	}

	return next({ ctx: { ...ctx, account: ctx.account } });
});

export const companyOwnerProcedure = accountProcedure.use(
	async ({ ctx, next }) => {
		if (!ctx.ownedCompanies?.some((company) => company.deletedAt === null)) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You are not the owner of any active companies",
			});
		}

		return next({ ctx: { ...ctx, ownedCompanies: ctx.ownedCompanies } });
	}
);
