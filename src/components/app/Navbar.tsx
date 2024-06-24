"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Icons } from "../Icons";
import { ComponentPropsWithoutRef } from "react";
import { FeedbackButton, InboxButton, HelpButton } from "./NavButtons";
import { MobileSidebar } from "./MobileSidebar";

export interface NavbarProps extends ComponentPropsWithoutRef<"div"> { }

export const Navbar = ({ ...props }: NavbarProps) => {
  return (
    <div className="bg-background h-12 flex flex-row justify-between items-center" {...props}>
      <div className="flex flex-row justify-start md:justify-between items-center w-full gap-6">
        <MobileSidebar triggerProps={{ className: "md:hidden" }} />
        <nav className="flex flex-row justify-center items-center h-full">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block">
                <Icons.slash className="w-4 h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block">
                <Icons.slash className="w-4 h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1">
                    Components
                    <Icons.chevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>Documentation</DropdownMenuItem>
                    <DropdownMenuItem>Themes</DropdownMenuItem>
                    <DropdownMenuItem>GitHub</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="flex-row justify-center items-center gap-2 hidden md:flex">
          <FeedbackButton />
          <InboxButton />
          <HelpButton />
        </div>
      </div>
    </div>
  );
}

