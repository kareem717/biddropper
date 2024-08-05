import { MessageInbox } from "@/components/messages/MessageInbox"
import { api } from "@/lib/trpc/api"

export default async function AccountInboxPage({ params }: { params: { id: string | undefined } }) {
  const { id: accountId } = await api.account.getLoggedInAccount.query()

  return (
    <div
      className="flex flex-col gap-4 p-2 md:p-8 h-full w-full"
    >
      <div>
        <h1 className="text-2xl font-bold">Inbox</h1>
      </div>
      <MessageInbox
        recipient={{ accountId }}
        className="w-full h-[90%]"
      />
    </div>
  )
}
