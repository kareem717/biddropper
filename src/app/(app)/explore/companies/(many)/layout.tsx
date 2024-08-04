"use client"

import { QuickSearch } from "@/components/app/QuickSearch";
import { useRouter } from "next/navigation";
import redirects from "@/config/redirects";

export default function ExploreJobsManyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="bg-background min-h-screen py-4 md:py-8">
      <div className="container mx-auto px-0">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-2">
          <h1 className="text-3xl font-bold">Companies</h1>
          <div className="flex flex-row items-center gap-2 w-full md:w-1/2">
            <QuickSearch className="w-full" onSearch={(keyword) => router.push(`${redirects.explore.companies}/search?query=${keyword}`)} />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
