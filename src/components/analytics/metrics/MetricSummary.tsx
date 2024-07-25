"use client"

import { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "@/lib/utils"
import { MetricCard } from "./MetricCard"

export interface MetricSummaryProps extends ComponentPropsWithoutRef<"div"> { }

export const MetricSummary: FC<MetricSummaryProps> = ({ className, ...props }) => {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-4 sm:mt-8", className)} {...props}>
      <MetricCard label="MCV" icon="telescope" value="10K" numericChange={-10} changeSuffix="%" description="Monthly view count of your company profile" />
      <MetricCard label="MBR" icon="gavel" value="209" numericChange={80} changeSuffix=" today" description="Monthly bids received by your company" />
    </div>
  )
}
