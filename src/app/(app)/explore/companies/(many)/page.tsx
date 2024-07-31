"use client";

import { CompanyIndexCard } from "@/components/companies/CompanyIndexCard";
import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useSearchParams } from "next/navigation";
import { ErrorDiv } from "@/components/app/ErrorDiv";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompanyExplorePage() {
  const page = useSearchParams().get("page");
  const [includeDeleted] = useState<boolean>(false);
  const { data, isLoading, isError, error, refetch, isRefetching, errorUpdateCount } = trpc.company.recommendCompanies.useQuery({
    includeDeleted,
    pageSize: 10,
    cursor: page ? parseInt(page) : undefined,
  }, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: true
  })

  const companies = data?.data || []

  return (
    <>
      {isError ? (
        <ErrorDiv message={error?.message} retry={refetch} isRetrying={isRefetching} retriable={errorUpdateCount < 3} />
      ) : isLoading || isRefetching ? (
        Array(10).map((_, idx) => (
          <Skeleton key={idx} className="h-20 w-full" />
        ))
      ) : companies.length > 0 ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {companies.map((company) => (
              <CompanyIndexCard key={company.id} companyId={company.id} />
            ))}
          </div>
          {companies.length > 0 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  {data.hasPrevious && (
                    <PaginationPrevious href={`/explore/jobs?page=${data.previousPage}`} />
                  )}
                </PaginationItem>
                <PaginationItem>
                  {data.hasNext && (
                    <PaginationNext href={`/explore/jobs?page=${data.nextPage}`} />
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">No companies found</div>
      )
      }
    </>
  );
};

