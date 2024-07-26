"use client"

import { ChartShell } from "@/components/analytics/charts/ChartShell";
import { PieChart, Pie, Legend, Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ComponentPropsWithoutRef, FC, ReactNode } from "react"
import { ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { trpc } from "@/lib/trpc/client";


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

const chartData = [
  { month: "January", company: 186, job: 80 },
  { month: "February", company: 305, job: 200 },
  { month: "March", company: 237, job: 120 },
  { month: "April", company: 73, job: 190 },
  { month: "May", company: 209, job: 130 },
  { month: "June", company: 214, job: 140 },
]

export interface ViewComparisonChartProps extends ComponentPropsWithoutRef<'div'> {
  companyId: string;
}


export const ViewComparisonChart: FC<ViewComparisonChartProps> = ({
  companyId,
  className,
  ...props
}) => {

  const { data, isLoading } = trpc.analytics.GetCompanyJobViewComparison.useQuery({
    companyId,
  });

  if (!isLoading && !data) throw new Error("No data");

  return (
    <ChartShell title="Company Views vs Job Views" config={chartConfig} className={cn("h-[200px] w-full", className)} {...props}>
      {isLoading ? <div>Loading...</div> : (
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
      )}
    </ChartShell>
  )
}
