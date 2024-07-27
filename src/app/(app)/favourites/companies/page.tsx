"use client"

import { useAuth } from "@/components/providers/AuthProvider";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationEllipsis, PaginationNext } from "@/components/ui/pagination"
import { trpc } from "@/lib/trpc/client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FavouriteCompanyCard } from "@/components/companies/FavouriteCompanyCard";

export default function FavouriteCompaniesPage() {
  const { account } = useAuth();
  if (!account) throw new Error("Account not found");

  const page = useSearchParams().get("page");
  const [includeDeleted] = useState<boolean>(false);
  const { data, isLoading, isError, error, refetch } = trpc.company.getFavouritedCompanies.useQuery({
    accountId: account.id,
    includeDeleted,
    pageSize: 10,
    cursor: page ? parseInt(page) : undefined,
  })


  return (
    <section className="w-full py-12 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl flex flex-col justify-center items-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">My Favorite Construction Companies</h1>
          <div className="mt-8 flex flex-col gap-6">
            {isLoading ? <div>Loading...</div> : data?.data.length === 0 ? <div>No favourite companies found</div> : data?.data.map((company) => (
              <FavouriteCompanyCard key={company.id} company={company} accountId={account.id} onUnfavourite={() => refetch()} />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            {data?.hasNext || data?.hasPrevious ? (
              <Pagination>
                <PaginationContent>
                  {data?.hasPrevious ? (
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                  ) : null}
                  {data?.hasNext ? (
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  ) : null}
                </PaginationContent>
              </Pagination>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
