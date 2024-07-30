"use client"

import { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "@/lib/utils"
import { MetricCard } from "./MetricCard"
import { trpc } from "@/lib/trpc/client";

export interface MetricSummaryProps extends ComponentPropsWithoutRef<"div"> { }

export const MetricSummary: FC<MetricSummaryProps> = ({ className, ...props }) => {
  const { data: analytics, isLoading: isAnalyticsLoading, error } = trpc.analytics.GetMonthlyAnalyticsByCompanyId.useQuery({ companyId: "3cf805b6-da72-46a9-a6bb-c1d134f2a072" });
  const { data: mostPopularJob, isLoading: isMostPopularJobLoading } = trpc.job.getMostPopularJobByCompanyId.useQuery({ companyId: "3cf805b6-da72-46a9-a6bb-c1d134f2a072" });

  if (!isAnalyticsLoading && !isMostPopularJobLoading) {
    if (!analytics || !mostPopularJob) {
      throw new Error("No analytics or most popular job data found")
    }
  } else {
    return <div>loading</div>
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-4 sm:mt-8", className)} {...props}>
      {analytics && mostPopularJob && (
        <>
          <MetricCard label="MCV" icon="telescope" metric={{ value: String(analytics.views.current), numericChange: analytics.views.percentageChange > 100 ? analytics.views.change : analytics.views.percentageChange, changeSuffix: "%" }} description="Monthly view count of your company profile" />
          <MetricCard label="MBR" icon="gavel" metric={{ value: String(analytics.bids.current), numericChange: analytics.bids.change, changeSuffix: "" }} description="Monthly bids received by your company" />
          <MetricCard label="MCF" icon="gavel" metric={{ value: String(analytics.favorites.current), numericChange: analytics.favorites.change, changeSuffix: "" }} description="The total number of accounts/companies that addded your company to their favourites." />
          <MetricCard
            label="Most Popular Job"
            metric={mostPopularJob.title}
            description="The total number of accounts/companies that addded your company to their favourites."
            href={`/job/${mostPopularJob.id}`}
          />
        </>
      )}
    </div>
  )
}
