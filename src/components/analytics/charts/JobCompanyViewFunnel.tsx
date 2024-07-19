"use client"

import { ChartShell } from "@/components/analytics/charts/ChartShell";
import { FunnelChart, Funnel, LabelList } from "recharts"
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

export interface JobCompanyViewFunnelProps extends ComponentPropsWithoutRef<'div'> { }

export const JobCompanyViewFunnel: FC<JobCompanyViewFunnelProps> = ({
  className,
  ...props
}) => {

  return (
    <ChartShell
      cardProps={{ className: "md:col-span-2" }}
      title="Total Bids"
      config={chartConfig}
      className={cn("h-[200px] w-full", className)}
      {...props}
    >
      <FunnelChart width={730} height={250}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Funnel
          dataKey="desktop"
          data={chartData}
          isAnimationActive
        >
          <LabelList position="right" fill="hsl(var(--color-desktop))" stroke="none" dataKey="desktop" />
        </Funnel>
      </FunnelChart>
    </ChartShell>
  )
}
