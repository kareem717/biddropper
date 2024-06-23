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
import { SendBidForm } from "../bids/SendBidForm"

export interface FullJobViewProps extends ComponentPropsWithoutRef<typeof Card> {
  jobId: string
}

export const FullJobView = ({ jobId, className, ...props }: FullJobViewProps) => {
  const { data: job, isLoading, isError, error } = trpc.job.getJobFull.useQuery({ id: jobId })
  if (isLoading) {
    return <p>Loading...</p>
  }
  if (isError) {
    return <p>Error: {error.message}</p>
  }

  if (!job) {
    return <p>No job found</p>
  }

  return (
    <>
      <div className="flex items-center mb-4">
        <div className="ml-2">
          <p className="font-semibold">{job.title}</p>
          <p className="text-muted-foreground">{job.start_date}</p>
        </div>
      </div>
      <h2 className="text-xl font-bold mb-2">{job.title}</h2>
      <p className="text-muted-foreground mb-4">{job.start_date}</p>
      <p>{job.description}</p>
      <div className="flex space-x-2 mt-4">
        {job.industries.map((industry, index) => (
          <Badge key={index}>{industry.industries.name}</Badge>
        ))}
      </div>
      <div className="mt-4">
        <Input placeholder={`Reply ${job.title}...`} />
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
            <SendBidForm jobId={job.id} />
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}