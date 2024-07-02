"use client"

import { trpc } from "@/lib/trpc/client"
import { cn, timeSince } from "@/utils"
import { ComponentPropsWithoutRef } from "react"
import { Badge } from "@/components/ui/badge"
import { titleCase } from "title-case"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"

export interface JobIndexCardProps extends ComponentPropsWithoutRef<'div'> {
  jobId: string
}


export const JobIndexCard = ({ jobId, className, ...props }: JobIndexCardProps) => {
  const { data, isLoading, isError, error } = trpc.job.getJobFull.useQuery({ id: jobId })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    throw new Error("Error fetching job")
  }
  if (!data) {
    throw new Error("No data")
  }


  const { job, industries, address } = data
  const ownerName = data.ownerAccount?.username || data.ownerCompany?.name

  return (
    <Card className="overflow-hidden flex flex-col justify-between hover:scale-105 focus-within:scale-105 md:hover:scale-110 md:focus-within:scale-110 transition-all duration-150">
      <CardHeader>
        <CardTitle>{titleCase(job.title)}</CardTitle>
        <CardDescription>{address.fullAddress}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-2">Posted by {ownerName}</p>
        <ScrollArea className="w-full whitespace-nowrap  mx-auto py-2">
          {industries.map((industry, index) => (
            <Badge key={index} className="mr-1">
              {titleCase(industry.name)}
            </Badge>
          ))}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <p className="text-muted-foreground text-sm">Posted {timeSince(new Date(job.createdAt))}</p>
      </CardContent>
      <CardFooter className="bg-primary px-6 py-4">
        <Link href={`/jobs/${jobId}`} className="text-background font-semibold">View Details</Link>
      </CardFooter>
    </Card>
  )
}