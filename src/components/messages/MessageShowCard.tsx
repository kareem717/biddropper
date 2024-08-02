"use client˝"

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { ShowMessage } from "@/lib/db/queries/validation"
import { ComponentPropsWithoutRef, FC } from "react"
import { timeSince, cn } from "@/lib/utils"
import { trpc } from "@/lib/trpc/client"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Icons } from "../Icons"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateMessageForm } from "./CreateMessageForm"
import { Skeleton } from "../ui/skeleton"
import { ErrorDiv } from "../app/ErrorDiv"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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
  onReplyClick?: () => void
  onClose?: () => void
}

export const MessageShowCard: FC<MessageShowCardProps> = ({
  message,
  recipient,
  className,
  onDelete,
  onMarkAsRead,
  onMarkAsUnread,
  onReplyClick,
  onClose,
  ...props
}) => {
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
  const { data: reply, isLoading, error, isError, refetch, isRefetching, errorUpdateCount } = trpc.message.getBasicById.useQuery({ messageId: message.replyTo?.replyTo }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: !!message.replyTo?.replyTo
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
    <>
      {isError ? (
        <ErrorDiv message={error.message} retry={refetch} isRetrying={isRefetching} retriable={errorUpdateCount < 3} />
      ) : !!message.replyTo?.replyTo && (isLoading || isRefetching) ? (
        <Skeleton className="w-full h-full" />
      ) : (
        <Card className={cn("", className)} {...props}>
          <CardHeader className="relative flex items-center justify-between pt-14 border-b">
            <div className="absolute top-0 left-0 flex justify-between items-center w-full h-12 bg-secondary rounded-t-lg px-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" onClick={onClose} aria-label="Close message">
                    <Icons.chevronsRight className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Close message</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex justify-center items-center gap-2">
                <Dialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild onClick={onReplyClick} aria-label="Reply to message">
                        <Button variant="ghost">
                          <Icons.reply className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reply to message</p>
                    </TooltipContent>
                  </Tooltip>
                  <DialogContent className="sm:max-w-[425px]">
                    <CreateMessageForm replyTo={[{
                      messageId: message.id, recipient: {
                        id: message.sender.id,
                        type: message.sender.type
                      }
                    }]} />
                  </DialogContent>
                </Dialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={handleDeleteMessage} aria-label="Delete message">
                      <Icons.trash className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete message</p>
                  </TooltipContent>
                </Tooltip>
                {message.reciepient?.readAt ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" onClick={handleUnreadMessage} aria-label="Mark as unread">
                        <Icons.close className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mark as unread</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" onClick={handleReadMessage} aria-label="Mark as read">
                        <Icons.check className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mark as read</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            <div className="flex justify-between items-start w-full">
              <div className="flex justify-center items-start gap-1">
                <Avatar>
                  <AvatarFallback className="capitalize">
                    {message.sender.name.split(" ").map(name => name[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-[2px]">
                  <h3 className="text-lg font-medium">
                    {message.sender.name}
                  </h3>
                  <p className="text-sm">
                    {message.title}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">{timeSince(new Date(message.createdAt))}</span>
              </div>
            </div>
          </CardHeader>
          {reply && (
            <div className="flex flex-col gap-1 border-b px-6 text-sm text-muted-foreground py-2">
              <p>Reply to: {reply.title}</p>
            </div>
          )}
          <CardContent className="pt-4">
            <p>{message.description}</p>
          </CardContent>
        </Card>)
      }
    </>
  )
}