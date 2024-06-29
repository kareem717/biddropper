"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { BidIndexCard } from "@/components/bids/BidIndexCard"
import { BidShowCard } from "@/components/bids/BidShowCard"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc/client"
import { TRPCClientError } from "@trpc/client"

export default function BidsPage() {
  const [selectedBid, setSelectedBid] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    status } = trpc.bid.getAccountReceivedBids.useInfiniteQuery({},
      {
        getNextPageParam: (lastPage, pages) => lastPage?.nextCursor ?? null,
      })

  const handleBidClick = (bid: any) => {
    setSelectedBid(bid.id)
    setShowDetails(true)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!data) {
    return <div>No bids</div>
  }

  return (
    <div className="grid grid-cols-3">
      <main className="flex-1 p-4 col-span-1">
        <div className="flex items-center justify-between mb-4">
          <Input placeholder="Search" className="mb-4" />
        </div>
        <ScrollArea className="grid grid-cols-1 gap-4 h-[80vh] px-4">
          {data.pages.map((page) => (
            page.data.map((bid) => (
              <BidIndexCard key={bid.bids.id} bidId={bid.bids.id} onClick={() => handleBidClick(bid.bids)} className="my-2" />
            ))
          ))}
          {isFetching && <div>Loading...</div>}
        </ScrollArea>
        {hasNextPage && (
          <Button onClick={() => fetchNextPage()}>Load More</Button>
        )}
      </main>
      {showDetails && selectedBid && (
        <aside className="p-4 border-l col-span-2">
          <BidShowCard bidId={selectedBid} />
        </aside>
      )}
    </div>
  )
}