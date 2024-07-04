"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { trpc } from "@/lib/trpc/client"
import { MessageIndexShell } from "@/components/messages/MessageIndexShell"
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
import { CreateMessageForm } from "@/components/messages/CreateMessageForm"

export default function CompanyInboxPage({ params }: { params: { id: string } }) {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [selectedMessage, setSelectedMessage] = useState<ShowMessage | null>(null)
  const { data: messages, isLoading } = trpc.message.getMessagesByCompanyId.useQuery({
    companyId: params.id,
  })

  if (isLoading) return <div>Loading...</div>
  if (!messages) return <div>No messages</div>

  return (
    <Drawer>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
        <CreateMessageForm />
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
