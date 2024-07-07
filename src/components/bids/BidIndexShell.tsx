"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { ReceivedBidIndexCard, SentBidIndexCard } from "./BidIndexCard"
import { trpc } from "@/lib/trpc/client"
import { ComponentPropsWithoutRef, FC, useState } from "react"
import { cn } from "@/utils"
import { ShowBid } from "@/lib/validations/bid"

export interface ReceivedBidIndexShellProps extends ComponentPropsWithoutRef<"div"> {
  bids: ShowBid[]
}

export const ReceivedBidIndexShell: FC<ReceivedBidIndexShellProps> = ({ bids, className, ...props }) => {
  return (
    <div className={cn("grid gap-4", className)} {...props}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Bids</h2>
        <div className="text-sm text-muted-foreground">{bids?.length} bid{bids?.length !== 1 && "s"}</div>
      </div>
      <ScrollArea className="h-max rounded-lg border">
        {
          <div className="grid gap-4 p-4">
            {bids.map((bid, i) => (
              <ReceivedBidIndexCard key={i} bid={bid} />
            ))}
          </div>
        }
      </ScrollArea>
    </div>
  )
}

export interface SentBidIndexShellProps extends ComponentPropsWithoutRef<"div"> {
  bids: ShowBid[]
}

export const SentBidIndexShell: FC<SentBidIndexShellProps> = ({ bids, className, ...props }) => {
  return (
    <div className={cn("grid gap-4", className)} {...props}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Bids</h2>
        <div className="text-sm text-muted-foreground">{bids?.length} bid{bids?.length !== 1 && "s"}</div>
      </div>
      <ScrollArea className="h-max rounded-lg border">
        {
          <div className="grid gap-4 p-4">
            {bids.map((bid, i) => (
              <SentBidIndexCard key={i} bid={bid} />
            ))}
          </div>
        }
      </ScrollArea>
    </div>
  )
}