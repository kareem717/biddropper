export async function createTRPCContext(opts: { headers: Headers }) {
	return {
		...opts,
	};
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
