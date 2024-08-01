"use client";

import { JobIndexCard } from "@/components/jobs/JobIndexCard";
import { trpc } from "@/lib/trpc/client";
import { ErrorDiv } from "@/components/app/ErrorDiv";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/Icons";

export default function JobExplorePage({params}: {params: {id: string}}) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    errorUpdateCount
  } = trpc.job.getByOwnerCompanyId.useQuery({
    companyId: params.id,
  }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  })

  const jobs = data || []

  return (
    <div className="bg-background min-h-screen py-4 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-2">
          <h1 className="text-3xl font-bold text-primary">My Jobs</h1>
          <Link href="/my-jobs/create" className={cn(buttonVariants(), "flex items-center gap-2")}>
            <Icons.add className="w-5 h-5" />
            Create
          </Link>
        </div>
        {isError ? (
          <ErrorDiv message={error?.message} retry={refetch} isRetrying={isRefetching} retriable={errorUpdateCount < 3} />
        ) : isLoading || isRefetching ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(10).map((_, idx) => (
                <Skeleton key={idx} className="h-20 w-full" />
              ))}
            </div>
          </div>
        ) :
          jobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {jobs.map((job) => (
                <JobIndexCard key={job.id} jobId={job.id} />
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">No jobs found</div>
          )
        }
      </div>
    </div>
  );
};

