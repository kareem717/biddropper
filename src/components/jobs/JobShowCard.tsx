"use client"

import {
  Card,
} from "@/components/ui/card"
import { trpc } from "@/lib/trpc/client"
import { ComponentPropsWithoutRef } from "react"
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
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropBidForm } from "../bids/DropBidForm"

export interface JobShowCardProps extends ComponentPropsWithoutRef<typeof Card> {
  jobId: string
}

export const JobShowCard = ({ jobId, className, ...props }: JobShowCardProps) => {
  const { data, isLoading, isError, error } = trpc.job.getJobFull.useQuery({ id: jobId })
  const { data: ownedCompanies, isLoading: isOwnedCompaniesLoading, isError: isOwnedCompaniesError, error: ownedCompaniesError } = trpc.company.getOwnedCompanies.useQuery({})
  if (isLoading || isOwnedCompaniesLoading) {
    return <p>Loading...</p>
  }
  if (isError || isOwnedCompaniesError) {
    const err = isError ? error : ownedCompaniesError
    return <p>Error: {err?.message}</p>
  }

  if (!data) {
    return <p>No job found</p>
  }

  const { industries, job, ownerCompany, ownerAccount } = data


  return (
    <>
      <div className="flex items-center mb-4">
        <Avatar>
          <AvatarFallback>{ownerCompany?.name || ownerAccount?.username}</AvatarFallback>
        </Avatar>
        <div className="ml-2">
          <p className="font-semibold">{ownerCompany?.name || ownerAccount?.username}</p>
          {ownerCompany?.emailAddress && <p className="text-muted-foreground">{ownerCompany?.emailAddress}</p>}
        </div>
      </div>
      <div className="flex items-center mb-4">
        <div className="ml-2">
          <p className="font-semibold">{job.title}</p>
          <p className="text-muted-foreground">{job.startDate}</p>
        </div>
      </div>
      <h2 className="text-xl font-bold mb-2">{job.title}</h2>
      <p className="text-muted-foreground mb-4">{job.startDate}</p>
      <p>{job.description}</p>
      <div className="flex space-x-2 mt-4">
        {industries.map((industry, index) => (
          <Badge key={index}>{industry.name}</Badge>
        ))}
      </div>
      {ownedCompanies?.length ? (
        <div className="mt-4">
          <Dialog>
            <DialogTrigger>
              <Button className="mt-2">Drop a bid</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DropBidForm jobId={job.id} />
            </DialogContent>
          </Dialog>
        </div>
      ) : null}
    </>
  )
}