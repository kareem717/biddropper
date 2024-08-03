"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { ReceivedBidIndexCard, SentBidIndexCard } from "./BidIndexCard"
import { trpc } from "@/lib/trpc/client"
import { ComponentPropsWithoutRef, FC, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ShowBid } from "@/lib/db/queries/validation"
import { ErrorDiv } from "../app/ErrorDiv"
import { Skeleton } from "../ui/skeleton"

export interface BidIndexShellProps extends ComponentPropsWithoutRef<"div"> {
  entity: {
    accountId: string
  } | {
    companyId: string
  } | {
    jobId: string
  }
  direction?: "incoming" | "outgoing"
  page?: number
  pageSize?: number
  scrollAreaProps?: ComponentPropsWithoutRef<typeof ScrollArea>
}

//TODO: ngl this makes me wanna yack
export const BidIndexShell: FC<BidIndexShellProps> = ({ entity, direction = "incoming", page = 1, pageSize = 10, className, scrollAreaProps, ...props }) => {
  const forEntity = 'accountId' in entity ? 'account' : 'companyId' in entity ? 'company' : 'job'
  const id = 'accountId' in entity ? entity.accountId : 'companyId' in entity ? entity.companyId : entity.jobId
  const incoming = direction === "incoming"
  const scrollAreaClassName = scrollAreaProps?.className

  const [bids, setBids] = useState<ShowBid[]>([])

  const {
    data: dataCompanyReceived,
    isLoading: isLoadingCompanyReceived,
    isError: isErrorCompanyReceived,
    error: errorCompanyReceived,
    refetch: refetchCompanyReceived,
    errorUpdateCount: errorUpdateCountCompanyReceived,
    isFetching: isFetchingCompanyReceived
  } = trpc.bid.getReceivedBidsByCompanyId.useQuery({
    companyId: id,
    pagination: { page, pageSize },
    filter: {}
  }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: forEntity === 'company' && incoming
  })

  const {
    data: dataAccountReceived,
    isLoading: isLoadingAccountReceived,
    isError: isErrorAccountReceived,
    error: errorAccountReceived,
    refetch: refetchAccountReceived,
    errorUpdateCount: errorUpdateCountAccountReceived,
    isFetching: isFetchingAccountReceived
  } = trpc.bid.getReceivedBidsByAccountId.useQuery({
    accountId: id,
    filter: {},
    pagination: { page, pageSize }
  }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: forEntity === 'account'
  })

  const {
    data: dataCompanySent,
    isLoading: isLoadingCompanySent,
    isError: isErrorCompanySent,
    error: errorCompanySent,
    refetch: refetchCompanySent,
    errorUpdateCount: errorUpdateCountCompanySent,
    isFetching: isFetchingCompanySent
  } = trpc.bid.getSentBidsByCompanyId.useQuery({
    companyId: id,
    pagination: { page, pageSize },
    filter: {}
  }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: forEntity === 'company' && !incoming
  })


  const {
    data: dataJob,
    isLoading: isLoadingJob,
    isError: isErrorJob,
    error: errorJob,
    refetch: refetchJob,
    errorUpdateCount: errorUpdateCountJob,
    isFetching: isFetchingJob
  } = trpc.bid.getRecievedBidsByJobId.useQuery({
    jobId: id,
    filter: {}
  }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: forEntity === 'job'
  })

  let data, isError, isLoading, errorUpdateCount, isRefetching, refetch, error;

  if (forEntity === 'account') {
    data = dataAccountReceived
    isError = isErrorAccountReceived
    isLoading = isLoadingAccountReceived
    errorUpdateCount = errorUpdateCountAccountReceived
    isRefetching = isFetchingAccountReceived
    refetch = refetchAccountReceived
    error = errorAccountReceived
  } else if (forEntity === 'company') {
    if (incoming) {
      data = dataCompanyReceived
      isError = isErrorCompanyReceived
      isLoading = isLoadingCompanyReceived
      errorUpdateCount = errorUpdateCountCompanyReceived
      isRefetching = isFetchingCompanyReceived
      refetch = refetchCompanyReceived
      error = errorCompanyReceived
    } else {
      data = dataCompanySent
      isError = isErrorCompanySent
      isLoading = isLoadingCompanySent
      errorUpdateCount = errorUpdateCountCompanySent
      isRefetching = isFetchingCompanySent
      refetch = refetchCompanySent
      error = errorCompanySent
    }
  } else {
    data = dataJob
    isError = isErrorJob
    isLoading = isLoadingJob
    errorUpdateCount = errorUpdateCountJob
    isRefetching = isFetchingJob
    refetch = refetchJob
    error = errorJob
  }


  useEffect(() => {
    if (data) {
      if ('data' in data) {
        setBids(data.data)
      } else {
        setBids(data)
      }
    }
  }, [data, forEntity])

  return (
    <div className={cn("grid gap-4", className)} {...props}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Bids</h2>
        {!isLoading && !isRefetching && !isError && (
          <div className="text-sm text-muted-foreground">{bids.length} bid{bids.length !== 1 && "s"}</div>
        )}
      </div>
      {isError ? (
        <ErrorDiv
          message={error?.message}
          retry={refetch}
          isRetrying={isRefetching}
          retriable={errorUpdateCount < 3}
        />
      ) : isLoading ? (
        <div className="grid grid-rows-4 gap-4 h-full w-full">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <ScrollArea className={cn("h-max rounded-lg border", scrollAreaClassName)} {...scrollAreaProps}>
          {
            <div className="grid gap-4 p-4">
              {bids.length ?
                bids.map((bid, i) => (
                  incoming ? <ReceivedBidIndexCard
                    key={i}
                    bid={bid}
                  />
                    : <SentBidIndexCard
                      key={i}
                      bid={bid}
                    />
                ))
                : (
                  <div className="text-sm text-muted-foreground py-24 text-center">No bids</div>
                )}
            </div>
          }
        </ScrollArea>
      )}
    </div>
  )
}