import { BidIndexShell } from "@/components/bids/BidIndexShell"

export default function CompanyReceivedBidsPage({ params, searchParams }: { params: { id: string }, searchParams: { page?: string | null } }) {
  const page = searchParams.page

  return (
    <div className="flex flex-col gap-4 h-full w-full px-2 md:px-8 pt-4 md:pt-10">
      <h1 className="text-3xl font-bold">Recieved Bids</h1>
      <BidIndexShell
        entity={{ companyId: params.id }}
        direction="incoming"
        page={page ? parseInt(page) : undefined}
        pageSize={10}
      />
    </div>
  )
}
