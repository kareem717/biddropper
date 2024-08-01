import { CompanyOwnerShowCard } from "@/components/companies/CompanyOwnerShowCard"

export default function CompanyOwnerShowPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <CompanyOwnerShowCard companyId={params.id} />
    </div>
  )
}