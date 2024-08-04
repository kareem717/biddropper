"use client"

import { CompanyShowCard } from "@/components/companies/CompanyShowCard"

export default function CompanyShowPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <CompanyShowCard companyId={params.id} />
    </div>
  )
}