"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/utils"
import { ComponentPropsWithoutRef } from "react"
import { Badge } from "@/components/ui/badge"

export interface JobIndexCardProps extends ComponentPropsWithoutRef<typeof Card> {
  jobId: string
}

export const JobIndexCard = ({ jobId, className, ...props }: JobIndexCardProps) => {
  const { data: job, isLoading, isError, error } = trpc.job.getJobFull.useQuery({ id: jobId })
  return (
    <Card className={cn("cursor-pointer", className)} {...props}>
      {isLoading && <CardContent>Loading...</CardContent>}
      {isError && <CardContent>Error: {error.message}</CardContent>}
      {job && (
        <>
          <CardHeader>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription>{job.description.substring(0, 100)}...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mt-2">
              <Badge>{job.propertyType}</Badge>
              <Badge>{job.isCommercialProperty}</Badge>
              <Badge>{job.startDateFlag}</Badge>
            </div>
          </CardContent>
          <CardFooter className="text-muted-foreground">
            {new Date(job.startDate).toLocaleDateString()}
          </CardFooter>
        </>
      )}
    </Card >
  )
}