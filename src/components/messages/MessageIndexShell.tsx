"use client˝"

import { Card, CardHeader } from "@/components/ui/card"
import { ShowMessage } from "@/lib/validations/message"
import { ComponentPropsWithoutRef, FC } from "react"
import { timeSince, truncate, cn } from "@/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageIndexCard } from "@/components/messages/MessageIndexCard"
import { useState } from "react"
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
import { Icons } from "@/components/Icons"


export interface MessageIndexShellProps extends ComponentPropsWithoutRef<typeof Card> {
  messages: ShowMessage[]
}

export const MessageIndexShell: FC<MessageIndexShellProps> = ({ messages, className, ...props }) => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [selectedMessage, setSelectedMessage] = useState<ShowMessage | null>(null)

  const handleMarkAsRead = (ids: string[]) => {
  }

  const handleMessageClick = (message: ShowMessage) => {
    setSelectedMessage(message)
    setDrawerOpen(true)
  }
  return (
    <div>
      <ScrollArea className="h-96">
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
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="h-[90vh]">
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>{selectedMessage?.title}</DrawerTitle>
              <DrawerDescription>Sent by {'biddropper'} {timeSince(new Date(selectedMessage?.createdAt))}</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
              {selectedMessage?.description}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button className="flex justify-center items-center gap-2">
                  <Icons.trash className="w-4 h-4" />
                  Trash
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

    </div>
  )
}