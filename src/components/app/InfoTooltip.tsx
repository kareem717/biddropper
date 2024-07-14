"use client"

import { ComponentPropsWithoutRef, FC } from "react"
import { Icons } from "@/components/Icons"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface InfoTooltipProps extends ComponentPropsWithoutRef<typeof Tooltip> {
  description: string
  icon?: keyof typeof Icons
  className?: string
}

export const InfoTooltip: FC<InfoTooltipProps> = ({ className, description, icon, ...props }) => {
  const Icon = icon ? Icons[icon] : Icons["info"]

  return (
    <Tooltip {...props}>
      <TooltipTrigger>
        <Icon className="w-5 h-5 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent className={cn("w-[200px]", className)}>
        <p>{description}</p>
      </TooltipContent>
    </Tooltip>
  )
}
