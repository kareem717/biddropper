import { Icons } from "@/components/Icons";

import Link from "next/link";
import { ContentCard } from "@/components/app/ContentCard";
import { QuickSearch } from "@/components/app/QuickSearch";
import { buttonVariants } from "@/components/ui/button";
import { CompanyIndexCard } from "@/components/companies/CompanyIndexCard";
import { api } from "@/lib/trpc/api";

export default async function ProjectsPage() {
  const companies = await api.company.getOwnedCompanies.query();

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full h-12 flex items-center justify-between gap-4">
        <QuickSearch />
        <Link href={"/companies/create"} className={buttonVariants()}>
          <Icons.add className="w-4 h-4 mr-2" />
          <span>
            Create <span className="hidden sm:inline">New Company</span>
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-12">
        {companies?.map((company) => (
          <CompanyIndexCard key={company.id} companyId={company.id} name={company.name} />
        ))}
        <ContentCard href={"/companies/create"} className="flex items-center justify-center p-8">
          <Icons.add className="w-12 h-12 text-muted-foreground" />
        </ContentCard>
      </div>
    </div>
  );
};

