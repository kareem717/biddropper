"use client"

import { JobShowCard } from "@/components/jobs/JobShowCard";
import { useParams } from "next/navigation";

export default function JobShowPage({ params }: { params: { id: string } }) {
  return (
    <div className="w-full flex items-center justify-center p-4 md:p-24">
      <JobShowCard jobId={params.id} className="max-w-screen-lg " />
    </div>
  )
}