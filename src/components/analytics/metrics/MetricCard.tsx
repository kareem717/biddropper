"use client"

import { ComponentPropsWithoutRef, FC, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/Icons"
import { Badge } from "@/components/ui/badge"
import { InfoTooltip } from "@/components/app/InfoTooltip"
import Link from "next/link"

export interface MetricCardProps extends ComponentPropsWithoutRef<"div"> {
  label: string
  icon?: keyof typeof Icons
  metric: string | {
    value: string
    numericChange?: number
    changeSuffix?: string
  }
  href?: string
  description?: string
}

export const MetricCard: FC<MetricCardProps> = ({ className, children, label, icon, metric, href, description, ...props }) => {
  const Icon = icon ? Icons[icon] : undefined

  let ChangeIcon, changeColor;
  if (typeof metric === "object") {
    ChangeIcon = metric.numericChange !== undefined && metric.numericChange >= 0 ? Icons["arrowUpRight"] : Icons["arrowDownRight"]
    changeColor = metric.numericChange !== undefined && metric.numericChange >= 0 ? "bg-green-600 text-green-300" : "bg-red-600 text-red-300"
  }


  return (
    <div className={cn("flex justify-center gap-2 items-center w-full relative rounded-lg border p-4 bg-card text-card-foreground shadow-sm", className)} {...props}>
      {Icon && (
        <span className="flex items-center justify-center rounded-full p-4 bg-accent">
          <Icon className="w-7 h-7 text-muted-foreground stroke-[2.5px]" />
        </span>
      )}
      {href ? (
        <Link href={href}>
          <div className="flex flex-col gap-1 ml-4">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            {typeof metric === "string" ? (
              <span className="text-2xl font-semibold overflow-hidden text-ellipsis whitespace-nowrap hover:overflow-visible hover:whitespace-normal max-w-xs">
                {metric}
              </span>
            ) : (
              <span className="text-2xl font-semibold overflow-hidden hover:overflow-visible">
                {metric.value}
              </span>
            )}
          </div>
        </Link>
      ) : (
        <div className="flex flex-col gap-1 ml-4">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          {typeof metric === "string" ? (
            <span className="text-2xl font-semibold overflow-hidden text-ellipsis whitespace-nowrap hover:overflow-visible hover:whitespace-normal max-w-xs">
              {metric}
            </span>
          ) : (
            <span className="text-2xl font-semibold overflow-hidden hover:overflow-visible">
              {metric.value}
            </span>
          )}
        </div>
      )}

      {typeof metric === "object" && (
        <span className="ml-2">
          <Badge className={cn("text-sm flex items-center", changeColor)}>
            {metric.numericChange}{metric.changeSuffix}
            {ChangeIcon && (
              <ChangeIcon className="ml-0.5 w-5 h-5" />
            )}
          </Badge>
        </span>
      )}
      {description && (
        <div className="absolute right-3 top-3">
          <InfoTooltip description={description} />
        </div>
      )}
    </div>
  )
}
