import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";
import { Icons } from "../Icons";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

export interface FullSidebarProps extends ComponentPropsWithoutRef<"aside"> {
  className?: string;
}

export const FullSidebar = ({ className, ...props }: FullSidebarProps) => {
  return (
    <aside className={cn("border-r fixed w-14 hover:w-52 hover:shadow-xl transition-all bg-background duration-300 h-full z-10 overflow-hidden flex-col items-start justify-between hidden md:flex", className)} {...props}>
      <div className="flex flex-col gap-4 justify-center items-center mt-2 ml-2">
        LG
      </div>
      <div className="flex flex-col gap-4 justify-center items-center mb-2 ml-2">
        <Link href="/" className={cn("flex items-center justify-center", buttonVariants({ variant: "ghost" }))}>
          <Icons.cog className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
};