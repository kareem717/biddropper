"use client";

import { useParams } from "next/navigation";
import { EditJobForm } from "@/components/jobs/EditJobForm";
import { trpc } from "@/lib/trpc/client";

export default function JobEditPage({}) {
  const jobId = useParams().id;
  const { data: job, isLoading, isError, error } = trpc.job.getJobFull.useQuery({ id: jobId as string });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  if (!job) return <div>Job not found</div>;

  // Transform the job data to match the expected type
  const transformedJob = {
    ...job.job,
    industries: job.industries.map(industry => ({
      id: industry.id,
      name: industry.name,
      createdAt: industry.createdAt,
      updatedAt: industry.updatedAt,
      deletedAt: industry.deletedAt,
    })),
    address: {
      ...job.address,
      rawJson: job.address.rawJson as any,
    },
  };

  console.log(transformedJob.address);
  return <EditJobForm job={transformedJob} />;
}