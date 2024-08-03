"use client"

import { Icons } from "@/components/Icons";
import { QuickSearch } from "@/components/app/QuickSearch";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
          <h1 className="text-3xl font-bold">Jobs</h1>
          <div className="flex flex-row items-center gap-2 w-full md:w-1/2">
            <QuickSearch className="w-full" onSearch={(keyword) => router.push(`/explore/jobs/search?query=${keyword}`)} />
            <Link href="/jobs/create" className={cn(buttonVariants(), "flex items-center gap-2")}>
              <Icons.add className="w-4 h-4" />
              Create <span className="hidden md:inline">Job</span>
            </Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
