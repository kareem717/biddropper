"use client"

import { FC, ComponentPropsWithoutRef } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/utils"
import { titleCase } from "title-case";
import Link from "next/link"
import { trpc } from "@/lib/trpc/client"
import { AddressDisplay } from "@/components/app/AddressDisplay"
import { ShowAddress } from "@/lib/validations/address"
import { useAuth } from "../providers/AuthProvider"
import { useCompany } from "../providers/CompanyProvider"
import { DropBidForm } from "../bids/DropBidForm"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "../ui/button";
import { CreateMessageForm } from "../messages/CreateMessageForm";


export interface JobShowCardProps extends ComponentPropsWithoutRef<"div"> {
  jobId: string
}

export const JobShowCard: FC<JobShowCardProps> = ({ jobId, className, ...props }) => {
  const { data, isLoading } = trpc.job.getJobFull.useQuery({ id: jobId })
  const { companies } = useCompany()
  const { account } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Job not found</div>

  if (!data.ownerAccount && !data.ownerCompany) throw new Error("Owner not found")

  let sender: {
    displayName: string
    href: string
  } = { displayName: "", href: "" }; // Initialize sender with default values

  if (data.ownerAccount) {
    sender = {
      displayName: data.ownerAccount.username,
      href: `/accounts/${data.ownerAccount.id}`
    }
  }

  if (data.ownerCompany) {
    sender = {
      displayName: data.ownerCompany.name,
      href: `/companies/${data.ownerCompany.id}`
    }
  }

  console.log(companies)
  return (
    <div className={cn("flex flex-col md:flex-row gap-4", className)} {...props}>
      <div className="w-full">
        <div className="grid gap-4 h-full">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{titleCase(data.job.title)}</h1>
            <div className="text-sm text-muted-foreground">
              Posted on {new Date(data.job.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Owner</div>
              <Link href={sender.href} className="font-medium">{sender.displayName}</Link>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Address</div>
              <AddressDisplay address={data.address as ShowAddress} className="font-medium" />
            </div>
          </div>
          <div className="flex flex-col gap-4 border-b border-border pb-4">
            <div className="text-sm font-medium text-muted-foreground">Related Industries</div>
            <div className="flex flex-wrap gap-2">
              {data.industries.map((industry) => (
                <Badge variant="outline" className="px-2 py-1 text-xs" key={industry.id}>
                  {titleCase(industry.name)}
                </Badge>
              ))}
            </div>
          </div>
          <div className="prose">
            <p>
              {data.job.description}
            </p>
          </div>
        </div>
      </div>
      {companies.length > 0 && (
        <div className="w-full border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4">
          <h1 className="text-2xl font-bold mb-4">Drop a bid</h1>
          <DropBidForm jobId={jobId} />
          <Dialog>
            <DialogTrigger asChild><Button variant="outline" className="w-full mt-2">Request More Info</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request More Info</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </DialogDescription>

                <CreateMessageForm />
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}