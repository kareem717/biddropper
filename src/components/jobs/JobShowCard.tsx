"use client"

import { BidIndexShell } from "../bids/BidIndexShell"
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

export interface JobShowCardProps extends ComponentPropsWithoutRef<"div"> {
  jobId: string
}

const bidSection: FC<{ jobId: string, showBids: boolean }> = ({ jobId, showBids }) => (
  <div className="w-full border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4">
    {showBids ? (
      <BidIndexShell jobId={jobId} />
    ) : (
      <>
        <h1 className="text-2xl font-bold mb-4">Drop a bid</h1>
        <DropBidForm jobId={jobId} />
      </>
    )}
  </div>
);

export const JobShowCard: FC<JobShowCardProps> = ({ jobId, className, ...props }) => {
  const { data, isLoading } = trpc.job.getJobFull.useQuery({ id: jobId })
  const { companies } = useCompany()
  const { account } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Job not found</div>

  if (!data.ownerAccount && !data.ownerCompany) throw new Error("Owner not found")

  // only show the bid index if the user or their companies own the job
  let showBids = false;

  let sender: {
    displayName: string
    href: string
  } = { displayName: "", href: "" }; // Initialize sender with default values

  if (data.ownerAccount) {
    sender = {
      displayName: data.ownerAccount.username,
      href: `/accounts/${data.ownerAccount.id}`
    }
    showBids = data.ownerAccount.id === account?.id;
  }

  if (data.ownerCompany) {
    sender = {
      displayName: data.ownerCompany.name,
      href: `/companies/${data.ownerCompany.id}`
    }

    showBids = companies.some(c => c.id === data.ownerCompany?.id);
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
      {showBids || companies.length > 0 ? bidSection({ jobId, showBids }) : null}
    </div>
  )
}