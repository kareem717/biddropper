"use client"

import { ReceivedBidIndexShell } from "@/components/bids/BidIndexShell"
import { trpc } from "@/lib/trpc/client"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/components/providers/AuthProvider"

export default function AccountBidsPage({ params }: { params: { id: string } }) {
  const { account } = useAuth()
  if (!account) throw new Error("Account not found")

  const page = useSearchParams().get("page")
  const { data: bids, isLoading, isError, error } = trpc.bid.getReceivedBidsByAccountId.useQuery({
    accountId: account.id,
    cursor: page ? parseInt(page) : undefined,
    filter: {}
  })

  if (isError) return <div>Error: {error.message}</div>
  if (isLoading) return <div>Loading...</div>

  if (!bids) return <div>No bids found</div>

  return (
    <ReceivedBidIndexShell
      bids={bids.data}
    />
  )
}
