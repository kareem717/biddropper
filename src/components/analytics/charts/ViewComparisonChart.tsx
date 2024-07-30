"use client"

import { ChartShell } from "@/components/analytics/charts/ChartShell";
import { Area, AreaChart, XAxis, YAxis } from "recharts"
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ComponentPropsWithoutRef, FC } from "react"
import { ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { trpc } from "@/lib/trpc/client";
import { ErrorDiv } from "@/components/app/ErrorDiv";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  companyViews: {
    label: "Company Views",
    color: "hsl(var(--muted-foreground))",
  },
  jobViews: {
    label: "Job Views",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig


export interface ViewComparisonChartProps extends ComponentPropsWithoutRef<'div'> {
  companyId: string;
}


export const ViewComparisonChart: FC<ViewComparisonChartProps> = ({
  companyId,
  className,
  ...props
}) => {

  const { data, isLoading, isError, error, isRefetching, refetch, errorUpdateCount } = trpc.analytics.GetCompanyJobViewComparison.useQuery({
    companyId,
  }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  return (
    <ChartShell title="Company Views vs Job Views" config={chartConfig} className={cn("h-[200px] w-full", className)} {...props}>
      {isError ? (
        <ErrorDiv message={error?.message} retry={refetch} isRetrying={isRefetching} retriable={errorUpdateCount < 3} className="h-full w-full" />
      ) :
        isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <AreaChart data={data} margin={{ top: 5, right: 30, bottom: 5 }} accessibilityLayer>
            <defs>
              <linearGradient id="colorCompanyViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.companyViews.color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartConfig.companyViews.color} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorJobViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.jobViews.color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartConfig.jobViews.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area type="monotone" dataKey="jobViews" stroke={chartConfig.jobViews.color} fillOpacity={1} fill="url(#colorJobViews)" />
            <Area type="monotone" dataKey="companyViews" stroke={chartConfig.companyViews.color} fillOpacity={1} fill="url(#colorCompanyViews)" />
          </AreaChart>
        )
      }
    </ChartShell>
  )
}
