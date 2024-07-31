import { JobOwnerShowCard } from "@/components/jobs/JobOwnerShowCard";

export default async function JobOwnerShowPage({ params }: { params: { id: string } }) {
  return <JobOwnerShowCard jobId={params.id} className="max-w-screen-lg" />
}