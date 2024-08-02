import { MessageInbox } from "@/components/messages/MessageInbox"

export default async function CompanyInboxPage({ params }: { params: { id: string } }) {
  return (
    <div
      className="flex flex-col gap-4 p-2 md:p-8 h-full w-full"
    >
      <div>
        <h1 className="text-2xl font-bold">Company Inbox</h1>
      </div>
      <MessageInbox
        recipient={{ companyId: params.id }}
        className="w-full h-[90%]"
      />
    </div>
  )
}
