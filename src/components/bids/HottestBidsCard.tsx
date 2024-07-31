"use client"

import { ComponentPropsWithoutRef, FC } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ReceivedBidIndexCard } from "@/components/bids/BidIndexCard"
import { trpc } from "@/lib/trpc/client"
import { ErrorDiv } from "../app/ErrorDiv"
import { Skeleton } from "../ui/skeleton"

export interface HottestBidsCardProps extends ComponentPropsWithoutRef<typeof Card> {
  entity: { companyId: string } | { accountId: string }
}

export const HottestBidsCard: FC<HottestBidsCardProps> = ({
  className,
  entity,
  ...props
}) => {
  const forAccount = 'accountId' in entity ? true : false
  const id = 'accountId' in entity ? entity.accountId : entity.companyId
  const {
    data: accountBids,
    isLoading: accountBidsLoading,
    isError: isAccountBidsError,
    error: accountBidsError,
    refetch: accountBidsRefetch,
    isRefetching: accountBidsRefetching,
    errorUpdateCount: accountBidsErrorUpdateCount }
    = trpc.bid.getHottestBidsByAccountId.useQuery({
      accountId: id
    }, {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
      enabled: forAccount
    })

  const {
    data: companyBids,
    isLoading: companyBidsLoading,
    isError: isCompanyBidsError,
    error: companyBidsError,
    refetch: companyBidsRefetch,
    isRefetching: companyBidsRefetching,
    errorUpdateCount: companyBidsErrorUpdateCount }
    = trpc.bid.getHottestBidsByCompanyId.useQuery({
      companyId: id
    }, {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
      enabled: !forAccount
    })

  const isLoading = forAccount ? accountBidsLoading : companyBidsLoading
  const isRefetching = forAccount ? accountBidsRefetching : companyBidsRefetching
  const error = forAccount ? accountBidsError : companyBidsError
  const refetch = forAccount ? accountBidsRefetch : companyBidsRefetch
  const errorUpdateCount = forAccount ? accountBidsErrorUpdateCount : companyBidsErrorUpdateCount
  const isError = forAccount ? isAccountBidsError : isCompanyBidsError
  const bids = forAccount ? accountBids : companyBids

  return (
    <Card className={className} {...props}>
      {isError ? (
        <div className="w-full h-full py-4">
          <ErrorDiv message={error?.message} isRetrying={isRefetching} retry={refetch} retriable={errorUpdateCount < 3} className="w-full h-full" />
        </div>
      ) : (
        <>
          <CardHeader>
            <CardTitle>Top 10 Hottest Bids</CardTitle>
            <CardDescription>
              The following bids are currently the most popular on the platform.
            </CardDescription>
          </CardHeader>
          {isLoading || isRefetching ? (
            <div className="w-full h-[80vh] p-4">
              <Skeleton className="w-full h-full" />
            </div>
          ) : (
            <CardContent className="grid gap-4 p-4 overflow-y-auto">
              {bids && bids.length > 0 ? bids.slice(0, 10).map((bid, i) => (
                <ReceivedBidIndexCard key={i} bid={bid} />
              )) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">No bids found</p>
                </div>
              )}
            </CardContent>
          )}
        </>
      )}
    </Card>
  )
}