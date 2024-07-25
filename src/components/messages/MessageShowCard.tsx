"use client˝"

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { ShowMessage } from "@/lib/db/queries/validation"
import { ComponentPropsWithoutRef, FC } from "react"
import { timeSince, truncate, cn } from "@/lib/utils"
import { trpc } from "@/lib/trpc/client"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Icons } from "../Icons"

export interface MessageShowCardProps extends ComponentPropsWithoutRef<typeof Card> {
  message: ShowMessage
  recipient: {
    accountId: string
  } | {
    companyId: string
  }
  onDelete?: () => void
  onMarkAsRead?: () => void
  onMarkAsUnread?: () => void
}

export const MessageShowCard: FC<MessageShowCardProps> = ({ message, recipient, className, onDelete, onMarkAsRead, onMarkAsUnread, ...props }) => {
  const { mutate: readMessage } = trpc.message.readMessage.useMutation({
    onSuccess: () => {
      toast.success("Message marked as read")
    },
    onError: () => {
      toast.error("Uh oh!", {
        description: "Failed to mark message as read"
      })
    }
  })
  const { mutate: unreadMessage } = trpc.message.unreadMessage.useMutation({
    onSuccess: () => {
      toast.success("Message marked as unread")
    },
    onError: () => {
      toast.error("Uh oh!", {
        description: "Failed to mark message as unread"
      })
    }
  })
  const { mutate: deleteMessage } = trpc.message.deleteMessage.useMutation({
    onSuccess: () => {
      toast.success("Message deleted")
    },
    onError: () => {
      toast.error("Uh oh!", {
        description: "Failed to delete message"
      })
    }
  })

  const handleReadMessage = () => {
    readMessage({ messageId: message.id, recipient })
    onMarkAsRead?.()
  }
  const handleUnreadMessage = () => {
    unreadMessage({ messageId: message.id, recipient })
    onMarkAsUnread?.()
  }
  const handleDeleteMessage = () => {
    deleteMessage({ messageId: message.id, recipient })
    onDelete?.()
  }

  return (
    <Card className={cn("", className)} {...props}>
      <CardHeader className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">New message from {message.sender.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{timeSince(new Date(message.createdAt))}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p>{message.description}</p>
      </CardContent>
      <CardFooter>
        <Button className="flex justify-center items-center gap-2" onClick={handleDeleteMessage}>
          <Icons.trash className="w-4 h-4" />
          Trash
        </Button>
        {message.readAt ? (
          <Button className="flex justify-center items-center gap-2" onClick={handleUnreadMessage}>
            <Icons.close className="w-4 h-4" />
            Mark as unread
          </Button>
        ) : (
          <Button className="flex justify-center items-center gap-2" onClick={handleReadMessage}>
            <Icons.check className="w-4 h-4" />
            Mark as read
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}