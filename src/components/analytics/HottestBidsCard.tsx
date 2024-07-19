"use client"

import { ComponentPropsWithoutRef, FC, ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ReceivedBidIndexCard } from "@/components/bids/BidIndexCard"
import { trpc } from "@/lib/trpc/client"
import { useAuth } from "../providers/AuthProvider"

export interface HottestBidsCardProps extends ComponentPropsWithoutRef<typeof Card> {
}

export const HottestBidsCard: FC<HottestBidsCardProps> = ({
  className,
  ...props
}) => {
  const { account } = useAuth()
  const { data: bids, isLoading, isError, error } = trpc.bid.getHottestBidsByAccountId.useQuery({
    accountId: account?.id ?? ""
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Top 10 Hottest Bids</CardTitle>
        <CardDescription>
          The following bids are currently the most popular on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 p-4 overflow-y-auto">
        {bids.map((bid, i) => (
          <ReceivedBidIndexCard key={i} bid={bid} />
        ))}
      </CardContent>
    </Card >
  )
}
