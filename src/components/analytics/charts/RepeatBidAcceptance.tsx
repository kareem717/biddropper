"use client"

import { ChartShell } from "@/components/analytics/charts/ChartShell";
import { RadialBarChart, RadialBar } from "recharts"
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


const radialChartData = [
  { month: "January", desktop: 186, mobile: 80 },
]
export interface RepeatBidAcceptanceProps extends ComponentPropsWithoutRef<'div'> { }

export const RepeatBidAcceptance: FC<RepeatBidAcceptanceProps> = ({
  className,
  ...props
}) => {

  return (
    <ChartShell
      title="Total Bids"
      config={chartConfig}
      className={cn("h-[200px] w-full", className)}
      {...props}
    >
      <RadialBarChart
        width={730}
        height={250}
        innerRadius="60%"
        outerRadius="80%"
        data={radialChartData}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar label={{ fill: 'hsl(var(--color-desktop))', position: 'insideStart' }} background dataKey='desktop' />
      </RadialBarChart>
    </ChartShell>
  )
}
