"use client"

import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "@/lib/utils"
import { Icons } from "../Icons"
import { trpc } from "@/lib/trpc/client"
import { Card } from "../ui/card"
import { CompanyAnalyticLine } from "./CompanyAnalyticLine"
import { ErrorDiv } from "../app/ErrorDiv"
import { Skeleton } from "../ui/skeleton"

interface CompanyShowCardProps extends ComponentPropsWithoutRef<typeof Card> {
  companyId: string
}

export const CompanyShowCard: FC<CompanyShowCardProps> = ({ companyId, className, ...props }) => {
  const { data: company, isLoading, isError, error, refetch, isRefetching, errorUpdateCount } = trpc.company.getCompanyFull.useQuery({ id: companyId }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  })

  return (
    <>
      {
        isError ? (
          <ErrorDiv message={error?.message} isRetrying={isRefetching} retry={refetch} retriable={errorUpdateCount < 3} className="col-span-2" />
        ) : isLoading || isRefetching ? (
          <Skeleton className="w-full h-[70vh] max-h-[1000px] col-span-2" />
        ) : (
          <Card className={cn("p-6 md:p-10 max-w-3xl mx-auto", className)} {...props}>
            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold">{company.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icons.locate className="w-5 h-5" />
                    <span>{company.address.fullAddress}</span>
                  </div>
                </div>
                <Badge>{company.isVerified ? "Verified" : "Unverified"}</Badge>
              </div>
              <CompanyAnalyticLine companyId={companyId} />
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Service Area</div>
                  <div>{Number(company.serviceArea)} km</div>
                </div>
                <div className="grid gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Email</div>
                  <div>{company.emailAddress}</div>
                </div>
                <div className="grid gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Phone</div>
                  <div>{company.phoneNumber}</div>
                </div>
                <div className="grid gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Website</div>
                  <Link href={company.websiteUrl ?? "/"} className="underline" prefetch={false}>
                    {company.websiteUrl}
                  </Link>
                </div>
                <div className="grid gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Founded</div>
                  {/* Only select month and year */}
                  <div>{new Date(company.dateFounded).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icons.calendar className="w-5 h-5" />
                <span>Joined in {new Date(company.createdAt).getFullYear()}</span>
              </div>
            </div>
          </Card>
        )}
    </>
  )
}