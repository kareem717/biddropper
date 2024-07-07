"use client"

import { MessageInbox } from "@/components/messages/MessageInbox"
import { trpc } from "@/lib/trpc/client"
import { useState } from "react"
import { useAuth } from "@/components/providers/AuthProvider"

export default function AccountInboxPage() {
  const { account } = useAuth()
  if (!account) throw new Error("Account not found")

  const [keywordQuery, setKeywordQuery] = useState<string | undefined>(undefined)
  const [includeRead, setIncludeRead] = useState<boolean>(false)
  const [includeDeleted, setIncludeDeleted] = useState<boolean>(false)
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, refetch } = trpc.message.getReceivedMessagesByAccountId.useInfiniteQuery({
    accountId: account.id,
    keywordQuery,
    includeRead,
    includeDeleted,
    pageSize: 2,
  }, {
    getNextPageParam: (lastPage, pages) => lastPage.nextPage,
    getPreviousPageParam: (lastPage, pages) => lastPage.previousPage,
  })

  if (isError) return <div>Error: {error.message}</div>
  if (isLoading) return <div>Loading...</div>

  const messages = data?.pages.map(page => page.data).flat()

  const handleSearch = (query: string) => {
    setIncludeDeleted(true)
    setIncludeRead(true)
    setKeywordQuery(query)
    refetch()
  }


  return (
    <MessageInbox
      messages={messages}
      recipient={{ accountId: account.id }}
      onSearch={handleSearch}
      hasNext={hasNextPage ?? false}
      onLoadMore={() => fetchNextPage()}
    />
  )
}
