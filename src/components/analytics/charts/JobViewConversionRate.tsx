"use client"

import { ChartShell } from "@/components/analytics/charts/ChartShell";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ComponentPropsWithoutRef, FC } from "react"
import { ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2	))",
  },
} satisfies ChartConfig

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

export interface JobViewConversionRateProps extends ComponentPropsWithoutRef<'div'> { }

export const JobViewConversionRate: FC<JobViewConversionRateProps> = ({
  className,
  ...props
}) => {

  return (
    <ChartShell title="Total Bids" config={chartConfig} className={cn("h-[200px] w-full", className)} {...props}>
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
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartShell>
  )
}
