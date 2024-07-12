"use client"

import { cn } from "@/utils"
import { ComponentPropsWithoutRef } from "react"
import Link from "next/link"
import { LogoDiv } from "../app/LogoDiv"
import { Button } from "../ui/button"
import redirects from "@/config/redirects"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Icons } from "../Icons"


export interface LandingNavBarProps extends ComponentPropsWithoutRef<'div'> {
}


export const LandingNavBar = ({ className, ...props }: LandingNavBarProps) => {
  return (
    <div className={cn("flex items-center justify-between backdrop-blur-md border-b fixed top-0 z-50 w-full px-4 sm:px-6 lg:px-8", className)} {...props}>
      <LogoDiv />
      <nav className="hidden md:flex flex-row items-center justify-between gap-4">
        <Link href={redirects.features} className="text-sm hover:text-muted-foreground transition-all duration-200">Features</Link>
        <Link href={redirects.pricing} className="text-sm hover:text-muted-foreground transition-all duration-200">Pricing</Link>
        <Link href={redirects.about} className="text-sm hover:text-muted-foreground transition-all duration-200">Demo</Link>
        <Link href={redirects.about} className="text-sm hover:text-muted-foreground transition-all duration-200">About</Link>
        <Link href={redirects.contact} className="text-sm hover:text-muted-foreground transition-all duration-200">Contact Us</Link>
      </nav>
      <div className="hidden md:flex flex-row items-center justify-between gap-2 ">
        <Button variant="ghost">Demo</Button>
        <Button>Get Started</Button>
      </div>
      <Sheet>
        <SheetTrigger className="md:hidden" asChild>
          <Button variant="ghost">
            <Icons.menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col items-start justify-between gap-4">
          <div className="flex flex-col items-start justify-start gap-8 w-full">
            <SheetHeader>
              <LogoDiv className="w-full" />
            </SheetHeader>
            <nav className="flex flex-col items-start justify-between gap-4">
              <Link href={redirects.features} className="text-sm hover:text-muted-foreground transition-all duration-200">Features</Link>
              <Link href={redirects.pricing} className="text-sm hover:text-muted-foreground transition-all duration-200">Pricing</Link>
              <Link href={redirects.about} className="text-sm hover:text-muted-foreground transition-all duration-200">Demo</Link>
              <Link href={redirects.about} className="text-sm hover:text-muted-foreground transition-all duration-200">About</Link>
              <Link href={redirects.contact} className="text-sm hover:text-muted-foreground transition-all duration-200">Contact Us</Link>
            </nav>
          </div>
          <div className="flex flex-row items-center justify-between gap-2 w-full">
            <Button className="w-full">Get Started</Button>
            <Button variant="secondary" className="w-full">Demo</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}