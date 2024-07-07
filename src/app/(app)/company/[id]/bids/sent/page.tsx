"use client"

import { SentBidIndexShell } from "@/components/bids/BidIndexShell"
import { trpc } from "@/lib/trpc/client"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

export default function CompanySentBidsPage({ params }: { params: { id: string } }) {
  const page = useSearchParams().get("page")
  const { data, isLoading, isError, error } = trpc.bid.getSentBidsByCompanyId.useQuery({
    companyId: params.id,
    cursor: page ? parseInt(page) : undefined,
    filter: {}
  })

  if (isError) return <div>Error: {error.message}</div>
  if (isLoading) return <div>Loading...</div>

  const bids = data?.data || []
  return (
    <div className="flex flex-col gap-4 h-full w-full">
      <h1>Sent</h1>
      <SentBidIndexShell
        bids={bids}
      />
    </div>
  )
}
