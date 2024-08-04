import { HottestBidsCard } from "@/components/bids/HottestBidsCard";
import { api } from "@/lib/trpc/api";
import Link from "next/link";

export default async function OverviewPage() {
	const account = await api.account.getLoggedInAccount.query()

	return (
		<main className="p-4 sm:p-8 flex flex-col gap-8 justify-start items-center h-full w-full">
			<div className="flex justify-start items-center w-full">
				<h1 className="font-semibold text-2xl">Account Overview</h1>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
				<HottestBidsCard entity={{ accountId: account.id }} className="h-full" />
				<div className="grid grid-rows-2 grid-cols-1 gap-4 w-full">
					<Link href="/inbox" className="text-2xl bg-card font-bold flex items-center justify-center rounded-lg border shadow-sm">
						View Inbox
					</Link>
					<Link href="/inbox" className="text-2xl bg-card font-bold flex items-center justify-center rounded-lg border shadow-sm">
						View Bids
					</Link>
				</div>
			</div>
		</main>
	)
}
