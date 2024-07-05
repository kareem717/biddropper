"use client"

import { MessageInbox } from "@/components/messages/MessageInbox"
import { trpc } from "@/lib/trpc/client"
import { useState } from "react"

export default function AccountInboxPage({ params }: { params: { id: string } }) {
  const [keywordQuery, setKeywordQuery] = useState<string | undefined>(undefined)
  const [includeRead, setIncludeRead] = useState<boolean>(false)
  const [includeDeleted, setIncludeDeleted] = useState<boolean>(false)

  const { data: messages, isLoading, isError, error, refetch } = trpc.message.getReceivedMessagesByAccountId.useQuery({
    accountId: params.id,
    keywordQuery,
    includeRead,
    includeDeleted,
  })

  console.log(messages)
  if (isError) return <div>Error: {error.message}</div>
  if (isLoading) return <div>Loading...</div>

  const handleSearch = (query: string) => {
    setIncludeDeleted(true)
    setIncludeRead(true)
    setKeywordQuery(query)
    refetch()
  }

  return (
    <MessageInbox messages={messages} recipient={{ accountId: params.id }} onSearch={handleSearch} />
  )
}
