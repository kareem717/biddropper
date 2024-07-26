"use client"

import { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "@/lib/utils"
import { MetricCard } from "./MetricCard"

export interface MetricSummaryProps extends ComponentPropsWithoutRef<"div"> { }

export const MetricSummary: FC<MetricSummaryProps> = ({ className, ...props }) => {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-4 sm:mt-8", className)} {...props}>
      <MetricCard label="MCV" icon="telescope" metric={{ value: "10K", numericChange: -10, changeSuffix: "%" }} description="Monthly view count of your company profile" />
      <MetricCard label="MBR" icon="gavel" metric={{ value: "209", numericChange: 80, changeSuffix: " today" }} description="Monthly bids received by your company" />
      <MetricCard label="MCF" icon="gavel" metric={{ value: "21", numericChange: 0, changeSuffix: " today" }} description="The total number of accounts/companies that addded your company to their favourites." />
      <MetricCard
        label="Most Popular Job"
        metric="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos."
        description="The total number of accounts/companies that addded your company to their favourites."
        href="/job/123"
      />
    </div>
  )
}
