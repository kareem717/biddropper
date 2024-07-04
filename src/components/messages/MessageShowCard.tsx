"use client˝"

import { Card, CardHeader } from "@/components/ui/card"
import { ShowMessage } from "@/lib/validations/message"
import { ComponentPropsWithoutRef, FC } from "react"
import { timeSince, truncate, cn } from "@/utils"

export interface MessageShowCardProps extends ComponentPropsWithoutRef<typeof Card> {
  message: ShowMessage
}

export const MessageShowCard: FC<MessageShowCardProps> = ({ message, className, ...props }) => {
  return (
    <Card className={cn("", className)} {...props}>
      <CardHeader className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">New message from Mohammed</h3>
          <p className="text-sm text-muted-foreground truncate max-w-[50ch]">
            {truncate(message.description, 100)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{timeSince(new Date(message.createdAt))}</span>
        </div>
      </CardHeader>
    </Card>
  )
}