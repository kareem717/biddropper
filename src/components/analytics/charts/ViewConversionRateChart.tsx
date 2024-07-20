"use client"

import { ChartShell } from "@/components/analytics/charts/ChartShell";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ComponentPropsWithoutRef, FC } from "react"
import { ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

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

const chartData = [
  { month: "January", views: 186, bids: 80 },
  { month: "February", views: 305, bids: 200 },
  { month: "March", views: 237, bids: 120 },
  { month: "April", views: 73, bids: 190 },
  { month: "May", views: 209, bids: 130 },
  { month: "June", views: 214, bids: 140 },
]

export interface ViewConversionRateChartProps extends ComponentPropsWithoutRef<'div'> { }

export const ViewConversionRateChart: FC<ViewConversionRateChartProps> = ({
  className,
  ...props
}) => {

  return (
    <ChartShell title="Job View Conversion Rate" config={chartConfig} className={cn("h-[200px] w-full", className)} {...props}>
      <BarChart layout="vertical" accessibilityLayer data={chartData}>
        <CartesianGrid horizontal={false} />
        <XAxis
          type="number"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="views" fill="var(--color-views)" radius={4} />
        <Bar dataKey="bids" fill="var(--color-bids)" radius={4} />
      </BarChart>
    </ChartShell>
  )
}
