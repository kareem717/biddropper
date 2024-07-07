"use client";

import { JobIndexCard } from "@/components/jobs/JobIndexCard";
import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function JobSearchPage() {
  const page = useSearchParams().get("page");
  const query = useSearchParams().get("query");
  if (!query) {
    throw new Error("No query");
  }

  const [includeDeleted] = useState<boolean>(false);
  const { data, isLoading, isError, error } = trpc.job.searchJobsByKeyword.useQuery({
    keywordQuery: query,
    includeDeleted,
    pageSize: 10,
    cursor: page ? parseInt(page) : undefined,
  })

  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center">Loading...</div>;
  }

  if (isError) {
    return <div className="w-full h-full flex items-center justify-center">Error: {error.message}</div>;
  }

  const jobs = data.data || []

  return (
    jobs.length > 0 ? (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {jobs.map((job) => (
            <JobIndexCard key={job.id} jobId={job.id} />
          ))}
        </div>
        {jobs.length > 0 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                {data.hasPrevious && (
                  <PaginationPrevious href={`/explore/jobs/search?query=${query}&page=${data.previousPage}`} />
                )}
              </PaginationItem>
              <PaginationItem>
                {data.hasNext && (
                  <PaginationNext href={`/explore/jobs/search?query=${query}&page=${data.nextPage}`} />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    ) : (
      <div className="w-full h-full flex items-center justify-center">No jobs found</div>
    )
  );
};

