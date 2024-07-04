"use client";

import { useParams } from "next/navigation";
import { EditCompanyForm } from "@/components/companies/EditCompanyForm";
import { trpc } from "@/lib/trpc/client";

export default function EditCompanyPage({ params }: { params: { id: string } }) {
  const { data: company, isLoading, isError, error } = trpc.company.getCompanyFull.useQuery({ id: params.id });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  if (!company) return <div>Company not found</div>;

  // Transform the job data to match the expected type
  const transformedCompany = {
    ...company,
    industries: company.industries.map(industry => ({
      id: industry.id,
      name: industry.name,
      createdAt: industry.createdAt,
      updatedAt: industry.updatedAt,
      deletedAt: industry.deletedAt,
    })),
    address: {
      ...company.address,
      rawJson: company.address.rawJson as any,
    },
  };
  
  return <EditCompanyForm company={transformedCompany} />;
}