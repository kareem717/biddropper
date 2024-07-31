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
import { HistoryCard } from "@/components/app/HistoryCard";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/Icons";
import { toast } from "sonner";
import { ErrorDiv } from "@/components/app/ErrorDiv";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountHistoryPage() {
  const { account } = useAuth();
  if (!account) throw new Error("Account not found");

  const page = useSearchParams().get("page");
  const { data, isLoading, isError, error, refetch, isRefetching, errorUpdateCount, } = trpc.account.getAccountHistory.useQuery({
    accountId: account.id,
    pageSize: 10,
    page: page ? parseInt(page) : undefined,
  }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false
  })

  const { mutateAsync: clearHistory, isLoading: isClearingHistory } = trpc.account.clearHistory.useMutation({
    onError: (error) => {
      toast.error("Something went wrong", {
        description: error.message
      })
    },
    onSuccess: () => {
      toast.success("History cleared")
      refetch()
    }
  })

  const handleClearHistory = async () => {
    await clearHistory({ accountId: account.id })
  }

  return (
    <section className="w-full py-12 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl flex flex-col justify-center items-center">
          <div className="flex justify-between items-center w-full">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">My History</h1>
            <Button
              variant="secondary"
              disabled={isClearingHistory}
              onClick={handleClearHistory}
            >
              {isClearingHistory ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : "Clear History"}
            </Button>
          </div>

          <div className="mt-8 flex flex-col gap-6 w-full">
            {isError ? (
              <ErrorDiv message={error?.message} retry={refetch} isRetrying={isRefetching} retriable={errorUpdateCount < 3} className="w-full h-96" />
            ) :
              isLoading || isRefetching ? (
                Array(10).map((_, idx) => (
                  <Skeleton className="w-full h-24" key={idx} />
                ))
              ) : data?.data.length === 0 ? <div>No history found</div> : data?.data.map((history, idx) => {
                const type = history.jobId ? "job" : "company"
                const href = history.jobId ? `explore/jobs/${history.jobId}` : `explore/companies/${history.companyId}`
                const name = history.jobId ? history.jobTitle : history.companyName
                return <HistoryCard key={idx} name={name} href={href} type={type} className="w-full" />
              })}
          </div>
          <div className="mt-8 flex justify-center">
            {data?.hasNext || data?.hasPrevious ? (
              <Pagination>
                <PaginationContent>
                  {data?.hasPrevious ? (
                    <PaginationItem>
                      <PaginationPrevious href={`/history?page=${data?.previousPage}`} />
                    </PaginationItem>
                  ) : null}
                  {data?.hasNext ? (
                    <PaginationItem>
                      <PaginationNext href={`/history?page=${data?.nextPage}`} />
                    </PaginationItem>
                  ) : null}
                </PaginationContent>
              </Pagination>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
