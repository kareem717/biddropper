"use client"

import { ComponentPropsWithoutRef, FC, ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export interface ChartShellProps extends ComponentPropsWithoutRef<typeof ChartContainer> {
  title?: string
  description?: string
  footer?: ReactNode
  config: ChartConfig
  cardProps?: Omit<ComponentPropsWithoutRef<typeof Card>, "children">
}

export const ChartShell: FC<ChartShellProps> = ({
  title,
  description,
  footer,
  className,
  children,
  config,
  cardProps,
  ...props
}) => {
  const needsHeader = title || description

  return (
    <Card className={cn(cardProps?.className)} {...cardProps}>
      {needsHeader ? (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={cn("flex justify-center items-center p-4", needsHeader ? "pt-0" : "pt-6")}>
        <ChartContainer {...props} config={config} className={cn("h-[200px] w-full", className)}>
          {children}
        </ChartContainer>
      </CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card >
  )
}
