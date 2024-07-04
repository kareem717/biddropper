import { api } from "@/lib/trpc/api";

export default async function AccountLayout({
  params,
  children,
}: {
  params: {
    id: string
  }
  children: React.ReactNode;
}) {
  const account = await api.account.getAccount.query();
  if (account?.id !== params.id) {
    throw new Error("Forbidden");
  }

  return (
    <div>
      {children}
    </div>
  );
}
