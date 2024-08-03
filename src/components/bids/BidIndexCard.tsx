"use client"

import { cn } from "@/lib/utils"
import { ComponentPropsWithoutRef } from "react"
import { Badge } from "@/components/ui/badge"
import { timeSince } from "@/lib/utils"
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
import { ShowBid } from "@/lib/db/queries/validation"
import { titleCase } from "title-case"
import { trpc } from "@/lib/trpc/client"
import { toast } from "sonner"
import { Icons } from "../Icons"

export interface ReceivedBidIndexCardProps extends ComponentPropsWithoutRef<typeof Dialog> {
  bid: ShowBid
  onAccept?: () => void
  onReject?: () => void
}

export const ReceivedBidIndexCard = ({ bid, onAccept, onReject, ...props }: ReceivedBidIndexCardProps) => {
  const jobTitle = titleCase(bid.job.title)
  const amountFormatted = bid.bids.priceUsd
  const note = bid.bids.note
  const submissionDate = new Date(bid.bids.createdAt)
  const status = titleCase(bid.bids.status)

  const { mutateAsync: acceptBid, isLoading: acceptBidLoading } = trpc.bid.acceptBid.useMutation({
    onError: (error) => {
      toast.error("Uh oh!", {
        description: error.message
      })
    },
    onSuccess: () => {
      toast.success("Bid accepted!")
      onAccept?.()
    }
  })

  const { mutateAsync: rejectBid, isLoading: rejectBidLoading } = trpc.bid.rejectBid.useMutation({
    onError: (error) => {
      toast.error("Uh oh!", {
        description: error.message
      })
    },
    onSuccess: () => {
      toast.success("Bid rejected!")
      onReject?.()
    }
  })

  return (
    <Dialog {...props}>
      <DialogTrigger>
        <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-center border rounded-lg p-4 cursor-pointer">
          <div className="flex flex-col items-start justify-center">
            <div className="font-medium">{jobTitle}</div>
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
          <Button
            variant="outline"
            className="w-full"
            onClick={() => rejectBid({ bidId: bid.bids.id })}
            disabled={rejectBidLoading || acceptBidLoading}
          >
            {rejectBidLoading ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Reject"}
          </Button>
          <Button
            className="w-full"
            onClick={() => acceptBid({ bidId: bid.bids.id })}
            disabled={acceptBidLoading || rejectBidLoading}
          >
            {acceptBidLoading ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Accept"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


export interface SentBidIndexCardProps extends ComponentPropsWithoutRef<typeof Dialog> {
  bid: ShowBid
  onWithdraw?: () => void
}

export const SentBidIndexCard = ({ bid, onWithdraw, ...props }: SentBidIndexCardProps) => {
  const jobTitle = titleCase(bid.job.title)
  const amountFormatted = bid.bids.priceUsd
  const note = bid.bids.note
  const submissionDate = new Date(bid.bids.createdAt)
  const status = titleCase(bid.bids.status)

  const { mutateAsync: withdrawBid, isLoading: withdrawBidLoading } = trpc.bid.withdrawBid.useMutation({
    onError: (error) => {
      toast.error("Uh oh!", {
        description: error.message
      })
    },
    onSuccess: () => {
      toast.success("Bid withdrawn!")
      onWithdraw?.()
    }
  })

  return (
    <Dialog {...props}>
      <DialogTrigger>
        <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-center border rounded-lg p-4 cursor-pointer">
          <div className="flex flex-col items-start justify-center">
            <div className="font-medium">{jobTitle}</div>
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
          <Button
            variant="outline"
            className="w-full"
            onClick={() => withdrawBid({ bidId: bid.bids.id })}
            disabled={withdrawBidLoading}
          >
            {withdrawBidLoading ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Withdraw"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}