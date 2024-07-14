"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageIndexCard } from "@/components/messages/MessageIndexCard"
import { ShowMessage } from "@/lib/validations/message"
import { FC, useState } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { MessageShowCard } from "@/components/messages/MessageShowCard"
import { QuickSearch } from "../app/QuickSearch"
import { Button } from "../ui/button"
import { Icons } from "../Icons"
import { CreateMessageForm } from "./CreateMessageForm"

export interface MessageInboxProps {
  messages: ShowMessage[]
  recipient: {
    accountId: string
  } | {
    companyId: string
  }
  onSearch: (query: string) => void
  onDelete?: () => void
  onMarkAsRead?: () => void
  onMarkAsUnread?: () => void
  onLoadMore: () => void
  hasNext: boolean
}

export const MessageInbox: FC<MessageInboxProps> = ({ messages,
  recipient,
  onSearch,
  onDelete,
  onMarkAsRead,
  onMarkAsUnread,
  onLoadMore,
  hasNext,
  ...props }) => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [selectedMessage, setSelectedMessage] = useState<ShowMessage | null>(null)

  const handleMessageClick = (message: ShowMessage) => {
    setSelectedMessage(message)
    setDrawerOpen(true)
  }

  const handleDelete = () => {
    setSelectedMessage(null)
    onDelete?.()
  }

  const handleMarkAsRead = () => {
    setSelectedMessage(null)
    onMarkAsRead?.()
  }

  const handleMarkAsUnread = () => {
    setSelectedMessage(null)
    onMarkAsUnread?.()
  }

  const handleLoadMore = () => {
    onLoadMore?.()
  }


  return (
    <div className=" flex flex-col gap-6">
      <div className="flex flex-row items-center gap-2 w-full">
        <QuickSearch className="w-full" onSearch={onSearch} />
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
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="grid gap-2">
          {messages.map((message) => (
            <MessageIndexCard
              key={message.id}
              message={message}
              tabIndex={0}
              onClick={() => handleMessageClick(message)}
            />
          ))
          }
        </div >
        {hasNext && <Button onClick={handleLoadMore}>Load More</Button>}
      </ScrollArea>
      {selectedMessage && (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="h-[90vh]">
            <MessageShowCard
              message={selectedMessage}
              recipient={recipient}
              onMarkAsRead={handleMarkAsRead}
              onMarkAsUnread={handleMarkAsUnread}
              onDelete={handleDelete}
              className="border-none shadow-none"
            />
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}
