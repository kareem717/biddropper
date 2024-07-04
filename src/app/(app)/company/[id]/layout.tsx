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

  const getOwnedCompanies = await api.company.getOwnedCompanies.query({
    includeDeleted: true,
  });

  // Check if the user is the owner of the company
  if (!getOwnedCompanies?.some(company => company.id === params.id)) {
    throw new Error("Forbidden");
  }

  return (
    <div>
      {children}
    </div>
  );
}
