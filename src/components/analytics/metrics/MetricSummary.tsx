"use client"

import { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "@/lib/utils"
import { MetricCard } from "./MetricCard"

export interface MetricSummaryProps extends ComponentPropsWithoutRef<"div"> { }

export const MetricSummary: FC<MetricSummaryProps> = ({ className, ...props }) => {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-4 sm:mt-8", className)} {...props}>
      {[...Array(4)].map((_, i) => (
        <MetricCard key={i} label="Total Bids" icon="gavel" value="100K" percentageChange={i % 2 === 0 ? 10 : -10} description="This is a description" />
      ))}
    </div>
  )
}
