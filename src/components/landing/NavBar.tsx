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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export interface LandingNavBarProps extends ComponentPropsWithoutRef<'div'> {
}


export const LandingNavBar = ({ className, ...props }: LandingNavBarProps) => {
  return (
    <div className={cn("flex items-center justify-between backdrop-blur-md border-b fixed top-0 z-50 w-full px-4 sm:px-6 lg:px-8", className)} {...props}>
      <LogoDiv />
      <NavigationMenu className="hidden lg:block">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Features</NavigationMenuTrigger>
            <NavigationMenuContent>
              <Link href={redirects.features.sell}>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Sell
                </NavigationMenuLink>
              </Link>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href={redirects.pricing} legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Pricing
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href={redirects.demo} legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Demo
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href={redirects.about} legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                About
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href={redirects.contact} legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Contact Us
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="hidden lg:flex flex-row items-center justify-between gap-2 ">
        <Button variant="ghost">Demo</Button>
        <Button>Get Started</Button>
      </div>
      <Sheet>
        <SheetTrigger className="lg:hidden" asChild>
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
              <Link href={redirects.features.sell} className="text-sm hover:text-muted-foreground transition-all duration-200">Sell</Link>
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