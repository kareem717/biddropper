import { Icons } from "@/components/Icons";

import Link from "next/link";
import { QuickSearch } from "@/components/app/QuickSearch";
import { buttonVariants } from "@/components/ui/button";
import { CompanyIndexCard } from "@/components/companies/CompanyIndexCard";
import { api } from "@/lib/trpc/api";
import { cn } from "@/utils";

export default async function CompanyIndexPage() {
  const companies = await api.company.getOwnedCompanies.query({});

  return (
    <div className="bg-background min-h-screen py-4 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-2">
          <h1 className="text-3xl font-bold text-primary">Companies</h1>
          <div className="flex flex-row items-center gap-2 w-full md:w-1/2">
            <QuickSearch className="w-full" />
            <Link href="/companies/create" className={cn(buttonVariants(), "flex items-center gap-2")}>
              <Icons.add className="w-4 h-4" />
              Create <span className="hidden md:inline">Company</span>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {companies.map((company) => (
            <CompanyIndexCard key={company.id} companyId={company.id} />
          ))}
          <Link href="/companies/create" className="hover:scale-105 focus-within:scale-105 md:hover:scale-110 md:focus-within:scale-110 transition-transform duration-150 w-full h-full flex items-center justify-center rounded-lg border">
            <Icons.add className="w-1/2 h-1/2 text-muted-foreground stroke-[1]" />
          </Link>
        </div>
      </div>
    </div>
  );
};

