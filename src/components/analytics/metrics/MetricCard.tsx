"use client"

import { ComponentPropsWithoutRef, FC, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/Icons"
import { Badge } from "@/components/ui/badge"
import { InfoTooltip } from "@/components/app/InfoTooltip"

export interface MetricCardProps extends ComponentPropsWithoutRef<"div"> {
  label: string
  icon: keyof typeof Icons
  value: string
  numericChange: number
  changeSuffix?: string
  description?: string
}

export const MetricCard: FC<MetricCardProps> = ({ className, children, label, icon, value, numericChange, changeSuffix, description, ...props }) => {
  const Icon = Icons[icon]

  const ChangeIcon = numericChange > 0 ? Icons["arrowUpRight"] : Icons["arrowDownRight"]
  const changeColor = numericChange > 0 ? "bg-green-600 text-green-300" : "bg-red-600 text-red-300"

  return (
    <div className={cn("flex justify-center gap-2 items-center w-full relative rounded-lg border p-4 bg-card text-card-foreground shadow-sm", className)} {...props}>
      <span className="flex items-center justify-center rounded-full p-4 bg-accent">
        <Icon className="w-7 h-7 text-muted-foreground stroke-[2.5px]" />
      </span>
      <div className="flex flex-col gap-1 ml-4">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold">{value}</span>
      </div>
      <span className="ml-2">
        <Badge className={cn("text-sm flex items-center", changeColor)}>
          {numericChange}{changeSuffix}
          <ChangeIcon className="ml-0.5 w-5 h-5" />
        </Badge>
      </span>
      {description && (
        <div className="absolute right-3 top-3">
          <InfoTooltip description={description} />
        </div>
      )}
    </div>
  )
}
