import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/trpc/api";

export default async function JobLayout({
  params,
  children,
}: {
  params: {
    id: string
  }
  children: React.ReactNode;
}) {
  const { user } = useAuth()
  const job = await api.job.getJobFull.query({
    id: params.id
  })

  if (!job?.job) {
    throw new Error("Job not found");
  }

  if (job.ownerAccount) {
    const account = await api.account.getAccountByUserId.query({
      // root layout should provide user
      userId: user!.id,
    });
    if (account?.id !== job.ownerAccount.id) {
      throw new Error("Forbidden");
    }
  } else if (job.ownerCompany) {
    const getOwnedCompanies = await api.company.getOwnedCompanies.query({
      includeDeleted: true,
    });

    // Check if the user's company owns the job
    if (!getOwnedCompanies?.some(company => company.id === job.ownerCompany?.id)) {
      throw new Error("Forbidden");
    }
  } else {
    throw new Error("Forbidden");
  }

  return (
    <div className="w-full flex items-center justify-center p-4 md:p-24">
      {children}
    </div>
  );
}
