"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/utils"
import { ComponentPropsWithoutRef } from "react"
import { Badge } from "@/components/ui/badge"
import { toTitleCase } from "@/utils"

export interface BidIndexCardProps extends ComponentPropsWithoutRef<typeof Card> {
  bidId: string
}

export const BidIndexCard = ({ bidId, className, ...props }: BidIndexCardProps) => {
  const { data: bid, isLoading, isError, error } = trpc.bid.getBidFull.useQuery({ bidId })
  return (
    <Card className={cn("cursor-pointer", className)} {...props}>
      {isLoading && <CardContent>Loading...</CardContent>}
      {isError && <CardContent>Error: {error.message}</CardContent>}
      {bid && (
        <>
          <CardHeader>
            <CardTitle>{bid.job.title}</CardTitle>
            <CardDescription>{bid.bids.note?.substring(0, 100)}...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mt-2">
              <Badge>{toTitleCase(bid.bids.status)}</Badge>
              <Badge>{`$${bid.bids.priceUsd}`}</Badge>
              <Badge>{bid.senderCompanyName}</Badge>
            </div>
          </CardContent>
          <CardFooter className="text-mut ed-foreground">
            {new Date(bid.bids.createdAt).toLocaleDateString()}
          </CardFooter>
        </>
      )}
    </Card >
  )
}