"use client";

import { CompanyIndexCard } from "@/components/companies/CompanyIndexCard";
import { trpc } from "@/lib/trpc/client";
import { ErrorDiv } from "@/components/app/ErrorDiv";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/Icons";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function CompanyExplorePage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    errorUpdateCount
  } = trpc.company.getOwnedCompanies.useQuery({
    includeDeleted: true,
  }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  })

  const companies = data || []

  return (
    <div className="bg-background min-h-screen py-4 md:py-8">
      <div className="container mx-auto px-0">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-2">
          <h1 className="text-3xl font-bold">My Companies</h1>
          <Link href="/my-companies/create" className={cn(buttonVariants(), "flex items-center gap-2")}>
            <Icons.add className="w-5 h-5" />
            Create
          </Link>
        </div>
        {isError ? (
          <ErrorDiv message={error?.message} retry={refetch} isRetrying={isRefetching} retriable={errorUpdateCount < 3} />
        ) : isLoading || isRefetching ? (
          Array(10).map((_, idx) => (
            <Skeleton key={idx} className="h-20 w-full" />
          ))
        ) : companies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {companies.map((company) => (
              <CompanyIndexCard key={company.id} companyId={company.id} href={`my-companies/${company.id}`} />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">No companies found</div>
        )}
      </div>
    </div>
  );
};

