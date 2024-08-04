"use client"

import { FC, ComponentPropsWithoutRef, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { titleCase } from "title-case";
import Link from "next/link"
import { trpc } from "@/lib/trpc/client"
import { AddressDisplay } from "@/components/app/AddressDisplay"
import { ShowAddress } from "@/lib/db/queries/validation"
import { useAuth } from "../providers/AuthProvider"
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
import { JobAnalyticLine } from "./JobAnalyticLine";
import { ErrorDiv } from "../app/ErrorDiv";
import { Skeleton } from "../ui/skeleton";
import { ScrollArea } from "../ui/scroll-area";
import redirects from "@/config/redirects";

export interface JobShowCardProps extends ComponentPropsWithoutRef<"div"> {
  jobId: string
}

export const JobShowCard: FC<JobShowCardProps> = ({ jobId, className, ...props }) => {
  const { data, isLoading, isError, error, refetch, isRefetching, errorUpdateCount } = trpc.job.getJobFull.useQuery({ id: jobId }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  })
  const { data: companies } = trpc.company.getOwnedCompanies.useQuery({})
  const { mutate } = trpc.job.trackJobView.useMutation()

  const { account } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!data) return
    if (account) {
      mutate({ jobId });
    }
  }, [mutate, jobId, account, data, isLoading]);

  let sender: {
    displayName: string
    href: string
  } = { displayName: "", href: "" }; // Initialize sender with default values

  if (data?.ownerAccount) {
    sender = {
      displayName: data.ownerAccount.username,
      href: `#`
    }
  }

  if (data?.ownerCompany) {
    sender = {
      displayName: data.ownerCompany.name,
      href: `${redirects.explore.companies}/${data.ownerCompany.id}`
    }
  }

  return (
    <>
      {
        isError ? (
          <ErrorDiv message={error?.message} isRetrying={isRefetching} retry={refetch} retriable={errorUpdateCount < 3} className="col-span-2" />
        ) : isLoading || isRefetching ? (
          <Skeleton className="w-full h-[70vh] max-h-[1000px] col-span-2" />
        ) : (
          <div  {...props} className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
            <div className="flex flex-col items-center justify-start h-full w-full">
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">{titleCase(data.job.title)}</h1>
                  <div className="text-sm text-muted-foreground">
                    Posted on {new Date(data.job.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mt-2">
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
              </div>
              <JobAnalyticLine jobId={jobId} className="border-b border-border pb-4 w-full pt-2" />
              <ScrollArea className="w-full flex items-start justify-start h-full max-h-[500px] whitespace-pre-wrap p-2">
                {data.job.description}
              </ScrollArea>
            </div>
            {companies && companies.length > 0 && (
              <div className="w-full border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4">
                <h1 className="text-2xl font-bold mb-4">Drop a bid</h1>
                <DropBidForm jobId={jobId} companies={companies} />
                <Dialog>
                  <DialogTrigger asChild><Button variant="outline" className="w-full mt-2">Request More Info</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request More Info</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                      </DialogDescription>

                      <CreateMessageForm recipients={{ accountIds: data.ownerAccount?.id ? [data.ownerAccount.id] : [], companyIds: data.ownerCompany?.id ? [data.ownerCompany.id] : [] }} />
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div >
        )}
    </>
  )
}