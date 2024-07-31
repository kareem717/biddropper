"use client"

import { trpc } from "@/lib/trpc/client"
import { cn, timeSince } from "@/lib/utils"
import { ComponentPropsWithoutRef } from "react"
import { Badge } from "@/components/ui/badge"
import { titleCase } from "title-case"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { Skeleton } from "../ui/skeleton"
import { ErrorDiv } from "../app/ErrorDiv"

export interface JobIndexCardProps extends ComponentPropsWithoutRef<typeof Card> {
  jobId: string
}

export const JobIndexCard = ({ jobId, className, ...props }: JobIndexCardProps) => {
  const { data, isLoading, isError, error, isRefetching, refetch, errorUpdateCount } = trpc.job.getJobFull.useQuery({ id: jobId }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  })

  return (
    <>
      {isError ? (
        <ErrorDiv message={error?.message} retriable={errorUpdateCount < 3} retry={() => refetch()} isRetrying={isRefetching} className="w-full h-48" />
      ) : isLoading || isRefetching ? <Skeleton className="w-full h-48" /> : data && (
        <Card className={cn("overflow-hidden flex flex-col justify-between hover:scale-105 focus-within:scale-105 md:hover:scale-110 md:focus-within:scale-110 transition-all duration-150", className)} {...props}>
          <CardHeader>
            <CardTitle>{titleCase(data.job.title)}</CardTitle>
            <CardDescription>{data.address.fullAddress}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">Posted by {data.ownerAccount?.username || data.ownerCompany?.name}</p>
            <ScrollArea className="w-full whitespace-nowrap  mx-auto py-2">
              {data.industries.map((industry, index) => (
                <Badge key={index} className="mr-1">
                  {titleCase(industry.name)}
                </Badge>
              ))}
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <p className="text-muted-foreground text-sm">Posted {timeSince(new Date(data.job.createdAt))}</p>
          </CardContent>
          <CardFooter className="bg-primary px-6 py-4">
            <Link href={`/explore/jobs/${jobId}`} className="text-background font-semibold">View Details</Link>
          </CardFooter>
        </Card>
      )}
    </>
  )
} 