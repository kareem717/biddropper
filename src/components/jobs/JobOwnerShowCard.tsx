"use client"

import { BidIndexShell } from "../bids/BidIndexShell"
import { FC, ComponentPropsWithoutRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { titleCase } from "title-case";
import Link from "next/link"
import { trpc } from "@/lib/trpc/client"
import { AddressDisplay } from "@/components/app/AddressDisplay"
import { ShowAddress } from "@/lib/db/queries/validation"
import { buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Icons } from "../Icons"
import { ErrorDiv } from "../app/ErrorDiv"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface JobOwnerShowCardProps extends ComponentPropsWithoutRef<"div"> {
  jobId: string
}

export const JobOwnerShowCard: FC<JobOwnerShowCardProps> = ({ jobId, className, ...props }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data, isLoading, refetch, errorUpdateCount, isRefetching, isError, error } = trpc.job.getJobFull.useQuery({ id: jobId }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  })

  const { mutateAsync, isLoading: isDeleting } = trpc.job.deleteJob.useMutation({
    onSuccess: () => {
      toast.success("Success!", {
        description: "The job has been deleted."
      })
      setDialogOpen(false)
    },
    onError: () => {
      toast.error("Uh oh!", {
        description: "The job could not be deleted. Please try again."
      })
    }
  })

  let sender: {
    displayName: string
    href: string
  } = { displayName: "", href: "" }; // Initialize sender with default values

  if (data?.ownerAccount) {
    sender = {
      displayName: data.ownerAccount.username,
      href: `/accounts/${data.ownerAccount.id}`
    }
  }

  if (data?.ownerCompany) {
    sender = {
      displayName: data.ownerCompany.name,
      href: `/companies/${data.ownerCompany.id}`
    }
  }

  const handleJobDelete = async () => {
    await mutateAsync({ id: jobId })
  }



  return (
    <div  {...props} className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {isError ? (
        <ErrorDiv message={error?.message} isRetrying={isRefetching} retry={refetch} retriable={errorUpdateCount < 3} />
      ) : isLoading || isRefetching ? (
        <Skeleton className="w-[300px] h-[70vh] max-h-[1000px]" />
      ) : (
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
          <ScrollArea className="w-full flex items-start justify-start h-full max-h-[500px] whitespace-pre-wrap p-2">
              {data.job.description}
          </ScrollArea>
          <div className="flex gap-2 w-full">
            <Link href={`/my-jobs/${jobId}/edit`} className={cn(buttonVariants(), "w-full")}>
              Edit
            </Link>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger className={cn(buttonVariants({ variant: "outline" }), "w-full")} disabled={isDeleting}>
                {isDeleting ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Delete"}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                  This action is destructive. This will permanently delete the job, and all the data associated it.
                  The only way to recover it is by contacting support.
                </AlertDialogDescription>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDialogOpen(false)} >Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleJobDelete}>
                    {isDeleting ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
      <div className="w-full border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4">
        <BidIndexShell entity={{ jobId }} scrollAreaProps={{ className: "max-h-[800px] h-[60vh] min-h-[250px]" }} />
      </div>
    </div>
  )
}