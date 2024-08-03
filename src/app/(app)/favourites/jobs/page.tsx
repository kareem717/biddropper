"use client"

import { useAuth } from "@/components/providers/AuthProvider";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext
} from "@/components/ui/pagination"
import { trpc } from "@/lib/trpc/client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FavouriteJobCard } from "@/components/jobs/FavouriteJobCard";
import { ErrorDiv } from "@/components/app/ErrorDiv";
import { Skeleton } from "@/components/ui/skeleton";

export default function FavouriteJobsPage() {
  const { account } = useAuth();
  if (!account) throw new Error("Account not found");

  const page = useSearchParams().get("page");
  const [includeDeleted] = useState<boolean>(false);
  const { data, isLoading, isError, error, refetch, isRefetching, errorUpdateCount } = trpc.job.getFavouritedJobs.useQuery({
    accountId: account.id,
    includeDeleted,
    pageSize: 10,
    cursor: page ? parseInt(page) : undefined,
  }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  })

  return (
    <div className="w-full p-4 md:p-8 flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">My Favorite Jobs</h1>
      {isError ?
        (<ErrorDiv message={error?.message} isRetrying={isRefetching} retry={refetch} retriable={errorUpdateCount < 3} />) :
        isLoading ? (
          <div className="mt-8 flex flex-col gap-4 w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full" />
            ))}
          </div>
        ) : data && data.data.length > 0 ? (
          <div className="mt-8 flex flex-col gap-6">
            {data.data.map((job) => (
              <FavouriteJobCard key={job.id} job={job} accountId={account.id} onUnfavourite={() => refetch()} />
            ))}
            <div className="mt-8 flex justify-center">
              {data.hasNext || data.hasPrevious ? (
                <Pagination>
                  <PaginationContent>
                    {data.hasPrevious ? (
                      <PaginationItem>
                        <PaginationPrevious href={`/favourites/jobs?page=${data.previousPage}`} />
                      </PaginationItem>
                    ) : null}
                    {data.hasNext ? (
                      <PaginationItem>
                        <PaginationNext href={`/favourites/jobs?page=${data.nextPage}`} />
                      </PaginationItem>
                    ) : null}
                  </PaginationContent>
                </Pagination>
              ) : null}
            </div>
          </div>
        ) :
          (
            <div>No favourite jobs found</div>
          )
      }
    </div >
  )
}
