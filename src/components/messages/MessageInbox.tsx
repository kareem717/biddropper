"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageIndexCard } from "@/components/messages/MessageIndexCard"
import { ShowMessage } from "@/lib/db/queries/validation"
import { ComponentPropsWithoutRef, FC, useState } from "react"
import { MessageShowCard } from "@/components/messages/MessageShowCard"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { QuickSearch } from "@/components/app/QuickSearch"
import { Icons } from "@/components/Icons"
import { CreateMessageForm } from "@/components/messages/CreateMessageForm"
import { Button } from "@/components/ui/button"
import { ErrorDiv } from "@/components/app/ErrorDiv"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export interface MessageInboxProps extends ComponentPropsWithoutRef<"div"> {
  recipient: {
    accountId: string
  } | {
    companyId: string
  }
  keywordQuery?: string
  includeRead?: boolean
  includeDeleted?: boolean
}


export const MessageInboxLoading: FC = () => {
  return (
    <div className="flex flex-col gap-2 p-2">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

export const MessageInbox: FC<MessageInboxProps> = ({
  recipient,
  keywordQuery: initialKeywordQuery,
  includeRead: initialIncludeRead,
  includeDeleted: initialIncludeDeleted,
  className,
  ...props
}) => {
  const [keywordQuery, setKeywordQuery] = useState<string | undefined>(initialKeywordQuery)
  const [includeRead, setIncludeRead] = useState<boolean | undefined>(initialIncludeRead)
  const [includeDeleted, setIncludeDeleted] = useState<boolean | undefined>(initialIncludeDeleted)
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [selectedMessage, setSelectedMessage] = useState<ShowMessage | null>(null)

  const forAccount = 'accountId' in recipient
  const id = forAccount ? recipient.accountId : recipient.companyId

  const {
    data: accountData,
    isLoading: isAccountLoading,
    isError: isAccountError,
    error: accountError,
    fetchNextPage: fetchNextAccountPage,
    hasNextPage: hasNextAccountPage,
    refetch: refetchAccount,
    isRefetching: isAccountRefetching,
    errorUpdateCount: accountErrorUpdateCount
  } = trpc.message.getReceivedMessagesByAccountId.useInfiniteQuery({
    accountId: id,
    keywordQuery,
    includeRead,
    includeDeleted,
    pageSize: 2,
  }, {
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.previousPage,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: 'accountId' in recipient ? true : false,
  })

  const {
    data: companyData,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
    error: companyError,
    fetchNextPage: fetchNextCompanyPage,
    hasNextPage: hasNextCompanyPage,
    refetch: refetchCompany,
    isRefetching: isCompanyRefetching,
    errorUpdateCount: companyErrorUpdateCount
  } = trpc.message.getReceivedMessagesByCompanyId.useInfiniteQuery({
    companyId: id,
    keywordQuery,
    includeRead,
    includeDeleted,
    pageSize: 2,

  }, {
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.previousPage,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: 'companyId' in recipient ? true : false,
  })

  const {
    mutateAsync: markAsRead,
  } = trpc.message.readMessage.useMutation({
    onSuccess: () => {
      setSelectedMessage(null)
      toast.success("Message marked as read")
      refetch()
    },
    onError: (error) => {
      toast.error("Uh oh!", {
        description: error.message,
        action: {
          label: "Retry",
          onClick: () => markAsRead({
            recipient: recipient,
            messageId: selectedMessage!.id,
          }),
        },
      })
    }
  })

  const {
    mutateAsync: markAsUnread,
  } = trpc.message.unreadMessage.useMutation({
    onSuccess: () => {
      setSelectedMessage(null)
      toast.success("Message marked as unread")
      refetch()
    },
    onError: (error) => {
      toast.error("Uh oh!", {
        description: error.message,
        action: {
          label: "Retry",
          onClick: () => markAsUnread({
            recipient: recipient,
            messageId: selectedMessage!.id,
          }),
        },
      })
    }
  })

  const {
    mutateAsync: deleteMessage,
  } = trpc.message.deleteMessage.useMutation({
    onSuccess: () => {
      setSelectedMessage(null)
      toast.success("Message deleted")
      refetch()
    },
    onError: (error) => {
      toast.error("Uh oh!", {
        description: error.message,
        action: {
          label: "Retry",
          onClick: () => deleteMessage({
            recipient: recipient,
            messageId: selectedMessage!.id,
          }),
        },
      })
    }
  })

  let messages
  if (accountData) {
    messages = accountData?.pages.map(page => page.data).flat()
  } else {
    messages = companyData?.pages
      .map(page => page.data)
      .flat()
      .filter(message => message.senderCompanyId || message.senderAccountId) // Filter out messages with undefined sender.id
      .map(message => ({
        ...message,
      }))
  }

  const handleSearch = (query: string) => {
    setIncludeDeleted(true)
    setIncludeRead(true)
    setKeywordQuery(query)
    setSelectedMessage(null)
    refetch()
  }

  const handleLoadMore = () => {
    if (accountData) {
      fetchNextAccountPage()
    } else {
      fetchNextCompanyPage()
    }
  }

  const handleMessageClick = (message: ShowMessage) => {
    setSelectedMessage(message)
    setDrawerOpen(true)
  }

  const isLoading = forAccount ? isAccountLoading : isCompanyLoading
  const isError = forAccount ? isAccountError : isCompanyError
  const error = forAccount ? accountError : companyError
  const isRefetching = forAccount ? isAccountRefetching : isCompanyRefetching
  const errorUpdateCount = forAccount ? accountErrorUpdateCount : companyErrorUpdateCount
  const hasNextPage = forAccount ? hasNextAccountPage : hasNextCompanyPage
  const refetch = () => {
    if (forAccount) {
      refetchAccount()
    } else {
      refetchCompany()
    }
  }


  return (
    <div className={cn("flex flex-col gap-6 h-full w-full", className)} {...props}>
      <div className="flex flex-row items-center gap-2 w-full">
        <QuickSearch className="w-full" onSearch={handleSearch} />
        <Drawer >
          <DrawerTrigger asChild  >
            <Button className="flex items-center gap-2">
              <Icons.mailPlus className="w-4 h-4" />
              New <span className="hidden md:inline">Message</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[90vh]">
            <CreateMessageForm />
          </DrawerContent>
        </Drawer>
      </div>
      {isError ? (
        <ErrorDiv
          retry={() => refetch()}
          isRetrying={isRefetching}
          retriable={errorUpdateCount < 3}
          message={error?.message}
          className="my-24"
        />
      ) : isLoading || isRefetching ? <MessageInboxLoading /> : messages && messages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full w-full">
          <ScrollArea className={cn({
            "hidden md:block col-span-1": selectedMessage,
            "block col-span-2": !selectedMessage,
          })}>
            <div className="grid gap-2 mb-2">
              {messages.map((message) => (
                <MessageIndexCard
                  key={message.id}
                  message={message}
                  tabIndex={0}
                  onClick={() => handleMessageClick(message)}
                />
              ))}
            </div>
            {hasNextPage && <Button onClick={handleLoadMore} className="w-full">Load More</Button>}
          </ScrollArea>
          {selectedMessage && (
            <MessageShowCard
              message={selectedMessage}
              recipient={recipient}
              onMarkAsRead={() => markAsRead({
                recipient: recipient,
                messageId: selectedMessage.id,
              })}
              onMarkAsUnread={() => markAsUnread({
                recipient: recipient,
                messageId: selectedMessage.id,
              })}
              onDelete={() => deleteMessage({
                recipient: recipient,
                messageId: selectedMessage.id,
              })}
              onClose={() => setSelectedMessage(null)}
            />
          )}
        </div>
      ) : (
        <div>No messages</div>
      )}
    </div>
  )
}
