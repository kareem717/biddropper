"use client"

import { ChartShell } from "@/components/analytics/charts/ChartShell";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ComponentPropsWithoutRef, FC, ReactNode } from "react"
import { ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const chartConfig = {
  company: {
    label: "Company Views",
    color: "hsl(var(--muted-foreground))",
  },
  job: {
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

export interface ViewComparisonChartProps extends ComponentPropsWithoutRef<'div'> { }

export const ViewComparisonChart: FC<ViewComparisonChartProps> = ({
  className,
  ...props
}) => {

  return (
    <ChartShell title="Company Views vs Job Views" config={chartConfig} className={cn("h-[200px] w-full", className)} {...props}>
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
        <Bar dataKey="company" fill="var(--color-company)" radius={4} />
        <Bar dataKey="job" fill="var(--color-job)" radius={4} />
      </BarChart>
    </ChartShell>
  )
}
