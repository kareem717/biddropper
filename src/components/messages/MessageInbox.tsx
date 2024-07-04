"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageIndexCard } from "@/components/messages/MessageIndexCard"
import { ShowMessage } from "@/lib/validations/message"
import { FC, useState } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
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
}

export const MessageInbox: FC<MessageInboxProps> = ({ messages, recipient, ...props }) => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [selectedMessage, setSelectedMessage] = useState<ShowMessage | null>(null)

  const handleMessageClick = (message: ShowMessage) => {
    setSelectedMessage(message)
    setDrawerOpen(true)
  }

  return (
    <div className=" flex flex-col gap-6">
      <div className="flex flex-row items-center gap-2 w-full">
        <QuickSearch className="w-full" />
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
      </ScrollArea>
      {selectedMessage && (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="h-[90vh]">
            <MessageShowCard
              message={selectedMessage}
              recipient={recipient}
              onMarkAsRead={() => setDrawerOpen(false)}
              onMarkAsUnread={() => setDrawerOpen(false)}
              onDelete={() => {
                setDrawerOpen(false)
                setSelectedMessage(null)
              }}
              className="border-none shadow-none"
            />
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}
