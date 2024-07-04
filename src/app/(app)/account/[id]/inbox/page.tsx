import { MessageInbox } from "@/components/messages/MessageInbox"
import { api } from "@/lib/trpc/api"

export default async function AccountInboxPage({ params }: { params: { id: string } }) {
  const messages = await api.message.getReceivedMessagesByAccountId.query({
    accountId: params.id,
  })


  return (
    <MessageInbox messages={messages} recipient={{ accountId: params.id }} />
  )
}
