"use client";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from "react";
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
import navConfig from "@/config/nav";
import { ComponentPropsWithoutRef, FC } from "react";
import { FeedbackButton, InboxButton, HelpButton } from "./NavButtons";

export interface NavbarProps extends ComponentPropsWithoutRef<"div"> {
  accountId: string
}

export const Navbar: FC<NavbarProps> = ({ accountId, ...props }) => {
  const [open, setOpen] = useState(false);
  const { account, user } = useAuth();
  const path = usePathname().split("/").slice(1)

  return (
    <div className="bg-background h-12 flex flex-row justify-between items-center" {...props}>
      <div className="flex flex-row justify-start md:justify-between items-center w-full gap-6">
        <Sheet {...props} open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost">
              <Icons.menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>
                <LogoDiv />
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col justify-between h-full py-8">
              <div className="grid gap-4 py-4 text-muted-foreground">
                {navConfig.map((nav) => {

                  return (
                    <Collapsible key={nav.href}>
                      {nav.href ? (
                        <Link href={nav.href} onClick={() => setOpen(false)}>
                          <CollapsibleTrigger className={cn(path.includes(nav.urlPath) && "text-primary")}>{nav.title}</CollapsibleTrigger>
                        </Link>
                      ) : (
                        <CollapsibleTrigger className={cn(path.includes(nav.urlPath) && "text-primary")}>{nav.title}</CollapsibleTrigger>
                      )}
                      {nav.subItems && (
                        <CollapsibleContent className="ml-4 flex flex-col gap-1">
                          {nav.subItems.map((subItem) => (
                            <Link
                              href={`/${nav.urlPath}${subItem.href}`}
                              key={subItem.href}
                              onClick={() => setOpen(false)}
                              className={cn(path.includes(`/${nav.urlPath}${subItem.href}`) && "text-primary")}>
                              {subItem.title}
                            </Link>
                          ))}
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  )
                })}
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
        <div className="flex-row justify-center items-center gap-2 hidden md:flex">
          <FeedbackButton />
          <InboxButton accountId={accountId} />
          <HelpButton />
        </div>
      </div>
    </div>
  );
}

