import { MessageInbox } from "@/components/messages/MessageInbox"
import { api } from "@/lib/trpc/api"

export default async function AccountInboxPage() {
  const { id: accountId } = await api.account.getLoggedInAccount.query()

  return (
    <MessageInbox
      recipient={{ accountId }}
    />
  )
}
