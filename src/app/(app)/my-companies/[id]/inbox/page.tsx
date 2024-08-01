import { MessageInbox } from "@/components/messages/MessageInbox"

export default async function CompanyInboxPage({ params }: { params: { id: string } }) {
  return (
    <MessageInbox
      recipient={{ companyId: params.id }}
    />
  )
}
