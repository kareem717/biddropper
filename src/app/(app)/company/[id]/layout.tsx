import { api } from "@/lib/trpc/api";

export default async function CompanyLayout({
  params,
  children,
}: {
  params: {
    id: string
  }
  children: React.ReactNode;
}) {

  const company = await api.company.getCompanyFull.query({
    id: params.id,
  });

  if (!company) {
    throw new Error("Company not found");
  }

  const account = await api.account.getLoggedInAccount.query();

  if (company.ownerId !== account.id) {
    console.log(company.ownerId, account.id)
    throw new Error("Forbidden");
  }

  return (
    <div>
      {children}
    </div>
  );
}
