import { BidIndexShell } from "@/components/bids/BidIndexShell"
import { api } from "@/lib/trpc/api"

export default async function AccountBidsPage({ searchParams }: { searchParams: { page?: string | null } }) {
  const page = searchParams.page
  const account = await api.account.getLoggedInAccount.query()

  return (
    <div className="flex flex-col gap-4 h-full w-full">
      <h1>Recieved</h1>
      <BidIndexShell
        entity={{ accountId: account.id }}
        direction="incoming"
        page={page ? parseInt(page) : undefined}
        pageSize={10}
      />
    </div>
  )
}
