"use client˝"

import { Card, CardHeader } from "@/components/ui/card"
import { ShowMessage } from "@/lib/db/queries/validation"
import { ComponentPropsWithoutRef, FC } from "react"
import { timeSince, truncate, cn } from "@/lib/utils"

export interface MessageIndexCardProps extends ComponentPropsWithoutRef<typeof Card> {
  message: ShowMessage
}

export const MessageIndexCard: FC<MessageIndexCardProps> = ({ message, className, ...props }) => {
  return (
    <Card className={cn("hover:bg-primary/90 hover:text-background group", className)} {...props}>
      <CardHeader className="flex flex-row items-start justify-center">
        <div className="flex mr-2 w-2">
          {message.reciepient?.readAt ? null : <span className="w-2 h-2 rounded-full bg-primary mt-4 group-hover:bg-background" />}
        </div>
        <div className="space-y-1 w-full">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-medium">{message.sender.name}</h3>
            <span className="text-xs text-muted-foreground group-hover:text-background">{timeSince(new Date(message.createdAt))}</span>
          </div>
          <h4 className="text-sm font-medium">{message.title}</h4>
          <p className="text-sm text-muted-foreground group-hover:text-background truncate max-w-[50ch]">
            {truncate(message.description, 100)}
          </p>
        </div>
      </CardHeader>
    </Card>

  )
}