"use client"
import { CompanyShowCard } from "@/components/companies/CompanyShowCard"
import { useParams } from "next/navigation"

export default function CompanyShowPage() {
  const { id } = useParams()

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <CompanyShowCard companyId={id as string} />
    </div>
  )
}