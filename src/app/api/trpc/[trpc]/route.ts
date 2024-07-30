import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { NextRequest } from "next/server";
import { appRouter } from "@/lib/server/routers/_app";
import { createTRPCContext } from "@/lib/trpc/context";
import { env } from "@/lib/env.mjs";

const createContext = async (req: NextRequest) => {
	return createTRPCContext({
		headers: req.headers,
	});
};

const handler = (req: NextRequest) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: () => createContext(req),
		onError(opts) {
			const { error, type, path, input, ctx, req } = opts;

			if (env.NODE_ENV === "development") {
				console.error(
					`❌ tRPC failed on ${path ?? "<no-path>"}: ${JSON.stringify(
						{
							msg: error.message,
							cause: error.cause?.message,
						},
						null,
						2
					)}`
				);
			}

		},
	});

export { handler as GET, handler as POST };
