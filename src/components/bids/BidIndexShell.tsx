"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { BidIndexCard } from "../bids/BidIndexCard"
import { trpc } from "@/lib/trpc/client"
import { ComponentPropsWithoutRef, FC, useState } from "react"
import { cn } from "@/utils"

export interface BidIndexShellProps extends ComponentPropsWithoutRef<"div"> {
  jobId: string
}

export const BidIndexShell: FC<BidIndexShellProps> = ({ jobId, className, ...props }) => {
  const { data: bids, isLoading } = trpc.bid.getJobBids.useQuery({
    jobId,
  })

  return (
    <div className={cn("grid gap-4", className)} {...props}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Bids</h2>
        <div className="text-sm text-muted-foreground">{bids?.length} bid{bids?.length !== 1 && "s"}</div>
      </div>
      <ScrollArea className="h-max rounded-lg border">
        {isLoading ? <div>Loading...</div> :
          !bids ? <div>No bids found</div> :
            <div className="grid gap-4 p-4">
              {bids.map((bid, i) => (
                <BidIndexCard key={i} bid={bid} />
              ))}
            </div>
        }
      </ScrollArea>
    </div>
  )
}