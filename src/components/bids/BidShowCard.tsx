"use client"

import {
  Card,
} from "@/components/ui/card"
import { trpc } from "@/lib/trpc/client"
import { ComponentPropsWithoutRef } from "react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { DropBidForm } from "../bids/DropBidForm"
import { useAuth } from "@/components/providers/AuthProvider"
import { bidStatus } from "@/lib/db/drizzle/schema"
import { toTitleCase, timeSince } from "@/utils"
import { Icons } from "../Icons"
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export interface BidShowCardProps extends ComponentPropsWithoutRef<typeof Card> {
  bidId: string
}

const confirmDialog = (verb: string, onConfirm: () => void, isOpen: boolean, setIsOpen: (isOpen: boolean) => void) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Are you absolutely sure you want to ${verb}?`}</DialogTitle>
          <DialogDescription>
            This action can be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onConfirm}>{verb}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
export const BidShowCard = ({ bidId, className, ...props }: BidShowCardProps) => {
  const { account } = useAuth()
  const { data: bid, isLoading, isError, error } = trpc.bid.getBidFull.useQuery({ bidId: bidId })

  const { data: ownedCompanies,
    isLoading: isLoadingOwnedCompanies,
    isError: isErrorOwnedCompanies,
    error: errorOwnedCompanies } = trpc.company.getOwnedCompanies.useQuery()
  const { data: company, isLoading: isLoadingCompany, isError: isErrorCompany, error: errorCompany } = trpc.company.getCompanyById.useQuery(
    { id: bid?.bids.senderCompanyId || "" },

  );
  const [isAcceptOpen, setIsAcceptOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)

  if (isLoading) {
    return <p>Loading...</p>
  }
  if (isError) {
    return <p>Error: {error.message}</p>
  }

  if (!bid) {
    return <p>No bid found</p>
  }
  if (isLoadingOwnedCompanies) {
    return <p>Loading 2...</p>
  }
  if (isErrorOwnedCompanies) {
    return <p>Error 2: {errorOwnedCompanies.message}</p>
  }


  if (isLoadingCompany) {
    return <p>Loading 3...</p>
  }
  if (isErrorCompany) {
    return <p>Error 3: {errorCompany.message}</p>
  }


  const accountOwnsListing = account?.id === bid.job.ownerAccountId || ownedCompanies?.some(c => c.id === bid.job.ownerCompanyId)
  return (
    <div>
      <div className="flex items-center mb-4">
        <Avatar>
          <AvatarFallback>{company?.name[0]}</AvatarFallback>
        </Avatar>
        <div className="ml-2">
          <p className="font-semibold">{company?.name}</p>
          <p className="text-muted-foreground">{company?.emailAddress}</p>
        </div>
      </div>
      <Link href={`/jobs/${bid.job.id}`} className="text-xl font-bold mb-2">{toTitleCase(bid.job.title)}</Link>
      <div className="flex space-x-2 mt-4">
        <Badge >{toTitleCase(bid.bids.status)}</Badge>
        <Badge >{`$${bid.bids.priceUsd}`}</Badge>
        <Badge >Sent {timeSince(new Date(bid.bids.createdAt))}</Badge>
      </div>
      <p>{bid.bids.note}</p>
      <div className="mt-4 w-full">
        {accountOwnsListing &&
          <div className="flex flex-row space-x-2">
            <Button className="mt-2 w-full" key={company.id}>Reject</Button>
            <Button className="mt-2 w-full" key={company.id}>Accept</Button>
          </div>
        }
        {!accountOwnsListing && ownedCompanies?.some(c => c.id === bid.bids.senderCompanyId) && bid.bids.status === bidStatus.enumValues[0] &&
          <Button className="mt-2 w-full" key={company.id}>Withdraw</Button>
        }
      </div >
    </div>
  )
}