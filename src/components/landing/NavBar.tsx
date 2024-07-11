"use client"

import { trpc } from "@/lib/trpc/client"
import { cn, timeSince } from "@/utils"
import { ComponentPropsWithoutRef } from "react"
import { Badge } from "@/components/ui/badge"
import { titleCase } from "title-case"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { LogoDiv } from "../app/LogoDiv"
import { Button } from "../ui/button"
import redirects from "@/config/redirects"

export interface LandingNavBarProps extends ComponentPropsWithoutRef<'div'> {
}


export const LandingNavBar = ({ className, ...props }: LandingNavBarProps) => {
  return (
    <div className={cn("flex items-center justify-between backdrop-blur-md border-b fixed top-0 z-50 w-full px-4 sm:px-6 lg:px-8", className)} {...props}>
      <LogoDiv />
      <nav className="flex flex-row items-center justify-between gap-4">
        <Link href={redirects.features} className="text-sm hover:text-muted-foreground transition-all duration-200">Features</Link>
        <Link href={redirects.pricing} className="text-sm hover:text-muted-foreground transition-all duration-200">Pricing</Link>
        <Link href={redirects.about} className="text-sm hover:text-muted-foreground transition-all duration-200">Demo</Link>
        <Link href={redirects.about} className="text-sm hover:text-muted-foreground transition-all duration-200">About</Link>
        <Link href={redirects.contact} className="text-sm hover:text-muted-foreground transition-all duration-200">Contact Us</Link>
      </nav>
      <div className="flex flex-row items-center justify-between gap-2">
        <Button variant="ghost">Demo</Button>
        <Button>Get Started</Button>
      </div>
    </div>
  )
}