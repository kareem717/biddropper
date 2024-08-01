import { BidIndexShell } from "@/components/bids/BidIndexShell"

export default function CompanySentBidsPage({ params, searchParams }: { params: { id: string }, searchParams: { page?: string | null } }) {
  const page = searchParams.page

  return (
    <div className="flex flex-col gap-4 h-full w-full">
      <h1>Sent</h1>
      <BidIndexShell
        entity={{ companyId: params.id }}
        direction="outgoing"
        page={page ? parseInt(page) : undefined}
        pageSize={10}
      />
    </div>
  )
}
