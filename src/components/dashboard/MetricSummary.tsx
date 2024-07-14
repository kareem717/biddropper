"use client"

import { ComponentPropsWithoutRef, FC, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/Icons"
import { Badge } from "@/components/ui/badge"
import { InfoTooltip } from "@/components/app/InfoTooltip"

export interface MetricSummaryProps extends ComponentPropsWithoutRef<"div"> {
  label: string
  icon: keyof typeof Icons
  value: string
  percentageChange: number
  description?: string
}

export const MetricSummary: FC<MetricSummaryProps> = ({ className, children, label, icon, value, percentageChange, description, ...props }) => {
  const Icon = Icons[icon]

  const ChangeIcon = percentageChange > 0 ? Icons["arrowUpRight"] : Icons["arrowDownRight"]
  const changeColor = percentageChange > 0 ? "bg-green-600 text-green-300" : "bg-red-600 text-red-300"

  return (
    <div className={cn("flex justify-center gap-2 items-center w-full relative", className)} {...props}>
      <span className="flex items-center justify-center rounded-full p-4 bg-accent">
        <Icon className="w-7 h-7 text-primary/70 stroke-[2.5px]" />
      </span>
      <div className="flex flex-col gap-1 ml-4">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold">{value}</span>
      </div>
      <span className="ml-2">
        <Badge className={cn("text-sm flex items-center", changeColor)}>
          {percentageChange}%
          <ChangeIcon className="ml-0.5 w-5 h-5" />
        </Badge>
      </span>
      {description && (
        <div className="absolute -right-3 -top-3">
          <InfoTooltip description={description} />
        </div>
      )}
    </div>
  )
}
