"use client"

import { ChartShell } from "@/components/analytics/charts/ChartShell";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ComponentPropsWithoutRef, FC, ReactNode } from "react"
import { ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

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

const chartData = [
  { month: "January", sent: 186, accepted: 80 },
  { month: "February", sent: 305, accepted: 200 },
  { month: "March", sent: 237, accepted: 120 },
  { month: "April", sent: 73, accepted: 190 },
  { month: "May", sent: 209, accepted: 130 },
  { month: "June", sent: 214, accepted: 140 },
]

export interface BidAcceptanceChartProps extends ComponentPropsWithoutRef<'div'> { }

export const BidAcceptanceChart: FC<BidAcceptanceChartProps> = ({
  className,
  ...props
}) => {

  return (
    <ChartShell title="Bids Sent vs Accepted" className={cn("h-[600px] w-full", className)} {...props} config={chartConfig} >
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="sent" fill="var(--color-sent)" radius={4} />
        <Bar dataKey="accepted" fill="var(--color-accepted)" radius={4} />
      </BarChart>
    </ChartShell>
  )
}
