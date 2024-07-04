import { MessageInbox } from "@/components/messages/MessageInbox"
import { api } from "@/lib/trpc/api"

export default async function CompanyInboxPage({ params }: { params: { id: string } }) {
  const messages = await api.message.getReceivedMessagesByCompanyId.query({
    companyId: params.id,
  })


  return (
    <MessageInbox messages={messages} recipient={{ companyId: params.id }} />
  )
}
