import { cn } from "@/utils";
import { ComponentPropsWithoutRef } from "react";
import { Icons } from "../Icons";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

export interface FullSidebarProps extends ComponentPropsWithoutRef<"aside"> {
  className?: string;
}

export const FullSidebar = ({ className, ...props }: FullSidebarProps) => {
  return (
    <aside className={cn("border-r fixed w-14 group hover:w-52 hover:shadow-xl transition-all bg-background duration-300 h-full z-10 overflow-hidden flex-col items-start justify-between hidden md:flex", className)} {...props}>
      <div className="grid grid-cols-1 gap-2 justify-center items-center mt-2">
        <Link href="/" className="flex items-center justify-center w-14">
          <Icons.biddropper className="w-10 h-10" />
        </Link>
        <Link href="/" className={cn("grid grid-cols-1 group-hover:grid-cols-2", buttonVariants({ variant: "ghost" }))}>
          <Icons.building className="w-5 h-5" />
          <span className="text-sm font-medium hidden group-hover:block transition-all duration-300">Companies</span>
        </Link>
        <Link href="/" className={cn("flex items-start justify-center", buttonVariants({ variant: "ghost" }))}>
          <Icons.briefcase className="w-5 h-5" />
          <span className="text-sm font-medium hidden group-hover:block transition-all duration-300">Jobs</span>
        </Link>
        <Link href="/" className={cn("flex items-start justify-center", buttonVariants({ variant: "ghost" }))}>
          <Icons.gavel className="w-5 h-5" />
          <span className="text-sm font-medium hidden group-hover:block transition-all duration-300">Bids</span>
        </Link>
      </div>
      <div className="flex flex-col gap-4 justify-center items-center mb-2 ml-2">
        <Link href="/" className={cn("flex items-center justify-center", buttonVariants({ variant: "ghost" }))}>
          <Icons.cog className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
};