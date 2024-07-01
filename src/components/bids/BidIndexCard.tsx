"use client"

import { cn } from "@/utils"
import { ComponentPropsWithoutRef } from "react"
import { Badge } from "@/components/ui/badge"
import { toTitleCase, timeSince } from "@/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DetailedBid } from "@/lib/validations/bid"

export interface BidIndexCardProps extends ComponentPropsWithoutRef<typeof Dialog> {
  bid: DetailedBid
}

export const BidIndexCard = ({ bid, ...props }: BidIndexCardProps) => {
  const senderName = toTitleCase(bid.senderCompany.name)
  const jobTitle = toTitleCase(bid.job.title)
  const amountFormatted = bid.priceUsd
  const note = bid.note
  const submissionDate = new Date(bid.createdAt)
  const status = toTitleCase(bid.status)

  return (
    <Dialog {...props}>
      <DialogTrigger>
        <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-center border rounded-lg p-4 cursor-pointer">
          <div className="flex flex-col items-start justify-center">
            <div className="font-medium">{senderName}</div>
            <div className="text-sm text-muted-foreground">Sent {timeSince(submissionDate)}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold">{amountFormatted}</div>
            <Badge variant="secondary" className="px-2 py-1 text-xs">
              {status}
            </Badge>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bid Details</DialogTitle>
          <DialogDescription>Review the details of the bid and take action.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Sender Name</div>
              <div className="font-medium">{senderName}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Job Title</div>
              <div className="font-medium">{jobTitle}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Bid Amount</div>
              <div className="font-medium">{amountFormatted}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Bid Note</div>
              <div className={cn("text-sm text-muted-foreground", note ? "" : "text-muted-foreground")}>{note}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Submission Date</div>
              <div className="font-medium">{submissionDate.toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Bid Status</div>
              <Badge variant="secondary" className="px-2 py-1 text-xs">
                {status}
              </Badge>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col md:flex-row gap-2 items-center justify-center">
          <Button variant="outline" className="w-full">Reject</Button>
          <Button className="w-full">Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}