"use client"

import { ComponentPropsWithoutRef, ReactNode } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Icons } from "../Icons"

export interface InfoTooltipFooterProps extends ComponentPropsWithoutRef<typeof Tooltip> {
  children: ReactNode
}


export const InfoTooltip = ({ children, ...props }: InfoTooltipFooterProps) => {
  return (
    <Tooltip {...props}>
      <TooltipTrigger>
        <Icons.info className="w-4 h-4 mx-1 bg-background" />
      </TooltipTrigger>
      <TooltipContent className="w-60 backdrop-blur-md overflow-hidden mx-2 border">
        {children}
      </TooltipContent>
    </Tooltip>
  )
}
