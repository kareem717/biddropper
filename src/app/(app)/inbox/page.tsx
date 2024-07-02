"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { trpc } from "@/lib/trpc/client"
import { useAuth } from "@/components/providers/AuthProvider"
import { MessageIndexCard } from "@/components/message/MessageIndexCard"
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
  const { data: messages, isLoading } = trpc.message.getMessagesByAcoount.useQuery({
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

function CheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}


function EyeOffIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}


function TrashIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}