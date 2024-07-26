"use client"

import { ChartShell } from "@/components/analytics/charts/ChartShell";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ComponentPropsWithoutRef, FC } from "react"
import { ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { trpc } from "@/lib/trpc/client";

const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--muted-foreground))",
  },
  bids: {
    label: "Bids",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig


export interface ViewConversionRateChartProps extends ComponentPropsWithoutRef<'div'> {
  companyId: string;
}

export const ViewConversionRateChart: FC<ViewConversionRateChartProps> = ({
  companyId,
  className,
  ...props
}) => {

  const { data, isLoading } = trpc.analytics.GetJobViewBidComparison.useQuery({
    companyId,
  });

  if (!isLoading && !data) throw new Error("No data");

  return (
    <ChartShell title="Job View Conversion Rate" config={chartConfig} className={cn("h-[200px] w-full", className)} {...props}>
      {isLoading ? <div>Loading...</div> : (
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="weekNumber"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent labelKey="week" />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="views" fill={chartConfig.views.color} radius={4} />
          <Bar dataKey="bids" fill={chartConfig.bids.color} radius={4} />
        </BarChart>
      )}
    </ChartShell>
  )
}
