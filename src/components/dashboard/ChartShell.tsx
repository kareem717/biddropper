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
import { cn } from "@/lib/utils"
export interface ChartShellProps extends ComponentPropsWithoutRef<typeof Card> {
  title?: string
  description?: string
  footer?: ReactNode
}

export const ChartShell: FC<ChartShellProps> = ({ title, description, footer, className, children, ...props }) => {
  return (
    <Card className={cn(className)} {...props}>
      {title || description ? (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className="flex justify-center items-center">
        {children}
      </CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card >
  )
}
