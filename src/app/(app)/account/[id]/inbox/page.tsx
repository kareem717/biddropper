"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { trpc } from "@/lib/trpc/client"
import { useAuth } from "@/components/providers/AuthProvider"
import { MessageIndexCard } from "@/components/messages/MessageIndexCard"
import { ShowMessage } from "@/lib/validations/message"
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
import { timeSince } from "@/utils"
import { Icons } from "@/components/Icons"

export default function MessageIndexPage() {
  const { account } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [selectedMessage, setSelectedMessage] = useState<ShowMessage | null>(null)
  if (!account) throw new Error("Unauthorized")
  const { data: messages, isLoading } = trpc.message.getMessagesByAccountId.useQuery({
    accountId: account.id,
  })

  if (isLoading) return <div>Loading...</div>
  if (!messages) return <div>No messages</div>

  const handleMarkAsRead = (ids: string[]) => {
  }

  const handleMessageClick = (message: ShowMessage) => {
    setSelectedMessage(message)
    setDrawerOpen(true)
  }

  return (
    <>
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
    </>
  )
}
