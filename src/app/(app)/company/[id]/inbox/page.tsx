"use client"

import { MessageInbox } from "@/components/messages/MessageInbox"
import { trpc } from "@/lib/trpc/client"
import { ShowMessage } from "@/lib/validations/message"
import { useState } from "react"

export default function CompanyInboxPage({ params }: { params: { id: string } }) {
  const [keywordQuery, setKeywordQuery] = useState<string | undefined>(undefined)
  const [includeRead, setIncludeRead] = useState<boolean>(false)
  const [includeDeleted, setIncludeDeleted] = useState<boolean>(false)

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, refetch } = trpc.message.getReceivedMessagesByCompanyId.useInfiniteQuery({
    companyId: params.id,
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

  const messages = data?.pages
    .map(page => page.data)
    .flat()
    .filter(message => message.sender?.id) // Filter out messages with undefined sender.id
    .map(message => ({
      ...message,
    }))

  const handleSearch = (query: string) => {
    setIncludeDeleted(true)
    setIncludeRead(true)
    setKeywordQuery(query)
    refetch()
  }

  return (
    <MessageInbox
      //@ts-ignore
      messages={messages}
      recipient={{ companyId: params.id }}
      onSearch={handleSearch}
      hasNext={hasNextPage ?? false}
      onLoadMore={() => fetchNextPage()}
    />
  )
}
