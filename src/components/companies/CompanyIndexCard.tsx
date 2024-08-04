"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ComponentPropsWithoutRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AddressDisplay } from "../app/AddressDisplay";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { titleCase } from "title-case";
import { ShowAddress } from "@/lib/db/queries/validation";
import { ErrorDiv } from "../app/ErrorDiv";
import { Skeleton } from "../ui/skeleton";
import redirects from "@/config/redirects";

export interface CompanyIndexCardProps extends ComponentPropsWithoutRef<typeof Card> {
  companyId: string;
  href?: string;
}

export const CompanyIndexCard = ({ companyId, href, className, ...props }: CompanyIndexCardProps) => {
  const { data: company, isLoading, isError, error, isRefetching, refetch, errorUpdateCount } = trpc.company.getCompanyFull.useQuery({ id: companyId }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  })

  return (
    <>
      {isError ? (
        <ErrorDiv message={error?.message} retriable={errorUpdateCount < 3} retry={() => refetch()} isRetrying={isRefetching} className="w-full h-48" />
      ) : isLoading || isRefetching ? <Skeleton className="w-full h-48" /> : company && (
        <Card className={cn("overflow-hidden flex flex-col justify-between hover:scale-105 focus-within:scale-105 md:hover:scale-110 md:focus-within:scale-110 transition-all duration-150", className)} {...props}>
          <CardHeader className="flex justify-between flex-row items-center">
            <CardTitle>{company.name}</CardTitle>
            <Badge variant={company.isVerified ? "default" : "outline"}>{company.isVerified ? "Verified" : "Unverified"}</Badge>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full whitespace-nowrap mx-auto py-2">
              {company.industries.map((industry, index) => (
                <Badge key={index} className="mr-1">
                  {titleCase(industry.name)}
                </Badge>
              ))}
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <AddressDisplay address={company.address as ShowAddress} />
          </CardContent>
          <CardFooter className="bg-primary px-6 py-4">
            <Link href={href || `${redirects.explore.companies}/${companyId}`} className="text-background font-semibold">View Details</Link>
          </CardFooter>
        </Card>
      )}
    </>
  )
} 