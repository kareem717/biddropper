"use client"

import { ChartShell } from "@/components/analytics/charts/ChartShell";
import { CartesianGrid, XAxis, YAxis, LineChart, Line } from "recharts"
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ComponentPropsWithoutRef, FC, ReactNode } from "react"
import { ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { trpc } from "@/lib/trpc/client";

const chartConfig = {
  sent: {
    label: "Sent",
    color: "hsl(var(--muted-foreground))",
  },
  accepted: {
    label: "Accepted",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export interface BidAcceptanceChartProps extends ComponentPropsWithoutRef<'div'> {
  companyId: string;
}

export const BidAcceptanceChart: FC<BidAcceptanceChartProps> = ({
  companyId,
  className,
  ...props
}) => {
  const { data, isLoading } = trpc.analytics.GetBidsSentVersusAccepted.useQuery({
    companyId,
  });

  if (!isLoading && !data) throw new Error("No data");

  return (
    <ChartShell title="Bids Sent vs Accepted" className={cn("h-[200px] md:h-[600px] w-full", className)} {...props} config={chartConfig} >
      {isLoading ? <div>Loading...</div> : (
        <LineChart data={data} margin={{ top: 5, right: 30, bottom: 5 }} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="weekNumber" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent labelKey="week" />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line type="monotone" dataKey="sent" stroke={chartConfig.sent.color} />
          <Line type="monotone" dataKey="accepted" stroke={chartConfig.accepted.color} />
        </LineChart>
      )
      }
    </ChartShell >
  )
}
