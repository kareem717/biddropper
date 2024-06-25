"use client";

import { useParams } from "next/navigation";
import { EditCompanyForm } from "@/components/companies/EditCompanyForm";
import { trpc } from "@/lib/trpc/client";

export default function EditCompanyPage() {
  const companyId = useParams().id;
  const { data: company, isLoading, isError, error } = trpc.company.getCompanyFull.useQuery({ id: companyId as string });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  if (!company) return <div>Company not found</div>;

  // Transform the job data to match the expected type
  const transformedCompany = {
    ...company,
    industries: company.industries.map(industry => ({
      id: industry.id,
      name: industry.name,
      created_at: industry.created_at,
      updated_at: industry.updated_at,
      deleted_at: industry.deleted_at,
    })),
    address: {
      ...company.address,
      raw_json: company.address.raw_json as any,
    },
  };
  console.log(transformedCompany.address);
  return <EditCompanyForm company={transformedCompany} />;
}