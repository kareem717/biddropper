"use client";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";
import { Button } from "../ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Icons } from "@/components/Icons"
import { usePathname } from "next/navigation";
import { LogoDiv } from "./LogoDiv";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import Link from "next/link";
import { LargeModeToggle } from "./LargeModeToggle";
import { useAuth } from "@/components/providers/AuthProvider";
import redirects from "@/config/redirects";

export interface MobileSidebarProps extends ComponentPropsWithoutRef<typeof Sheet> {
  contentProps?: ComponentPropsWithoutRef<typeof SheetContent>;
  triggerProps?: ComponentPropsWithoutRef<typeof SheetTrigger>;
}

export const MobileSidebar = ({ contentProps, triggerProps, ...props }: MobileSidebarProps) => {
  const { className, ...otherContentProps } = contentProps || {};
  const { account, user } = useAuth();
  const path = usePathname().split("/").slice(1)
  console.log(path);
  return (
    <Sheet {...props}>
      <SheetTrigger asChild {...triggerProps}>
        <Button variant="outline">
          <Icons.menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" {...otherContentProps} className={cn(className)}>
        <SheetHeader>
          <SheetTitle>
            <LogoDiv />
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col justify-between h-full py-8">
          <div className="grid gap-4 py-4">
            <Collapsible>
              <CollapsibleTrigger>Can I use this in my project?</CollapsibleTrigger>
              <CollapsibleContent>
                Yes. Free to use for personal and commercial projects. No attribution
                required.
              </CollapsibleContent>
            </Collapsible>
            <Collapsible>
              <CollapsibleTrigger>Can I use this in my project?</CollapsibleTrigger>
              <CollapsibleContent>
                Yes. Free to use for personal and commercial projects. No attribution
                required.
              </CollapsibleContent>
            </Collapsible>
          </div>
          <div className="flex flex-col gap-4">
            <Link href={redirects.settings} className="flex items-center justify-between gap-4 px-2 hover:text-muted-foreground transition duration-150">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center border border-current rounded-full p-1">
                  <Icons.user className="w-4 h-4" />
                </div>
                {account?.username}
              </div>
              <div>
                <Icons.settings className="w-5 h-5 hover:animate-spin" />
                <span className="sr-only">Settings</span>
              </div>
            </Link>
            <LargeModeToggle />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
