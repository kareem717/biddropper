"use client"
import { cn } from "@/lib/utils"
import { ComponentPropsWithoutRef, useState } from "react"
import Link from "next/link"
import { LogoDiv } from "../../app/LogoDiv"
import { Button } from "../../ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Icons } from "../../Icons"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import landing from "@/config/landing"
import { buttonVariants } from "@/components/ui/button"
import { CTA } from "@/config/types"

export interface LandingNavBarProps extends ComponentPropsWithoutRef<'div'> {
  items: ({
    label: string;
    submenu: {
      label: string;
      href: string;
    }[];
    href?: undefined;
  } | {
    label: string;
    href: string;
    submenu?: undefined;
  })[]
  cta: CTA
  secondaryCta: CTA
}

export const LandingNavBar = ({ className, items, cta, secondaryCta, ...props }: LandingNavBarProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn("flex items-center justify-between sm:backdrop-blur-md bg-card sm:bg-transparent border-b fixed top-0 z-50 w-full px-4 sm:px-6 lg:px-8", className)} {...props}>
      <LogoDiv />
      <NavigationMenu className="hidden lg:block">
        <NavigationMenuList>
          {items.map((item, index) => {
            if (item.submenu) {
              return (
                <NavigationMenuItem key={index}>
                  <NavigationMenuTrigger className="bg-transparent">{item.label}</NavigationMenuTrigger>
                  <NavigationMenuContent className="flex flex-col items-center justify-center gap-2 p-1">
                    {item.submenu.map((subitem, subIndex) => (
                      <Link href={subitem.href} key={subIndex}>
                        <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent")}>
                          {subitem.label}
                        </NavigationMenuLink>
                      </Link>
                    ))}
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )
            } else {
              return (
                <NavigationMenuItem key={index}>
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent")}>
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )
            }
          })}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="hidden lg:flex flex-row items-center justify-between gap-2">
        <Link href={cta.href} className={cn(buttonVariants(), "w-full")}>{cta.label}</Link>
        <Link href={secondaryCta.href} className={cn(buttonVariants({ variant: "outline" }), "w-full")}>{secondaryCta.label}</Link>
      </div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
              {items.map((item, index) => {
                if (item.submenu) {
                  return (
                    <Collapsible className="flex flex-col items-start justify-between gap-2" key={index}>
                      <div className="flex flex-row items-center justify-between gap-2">
                        <span>{item.label}</span>
                        <CollapsibleTrigger >
                          <Icons.chevronDown className="w-4 h-4" />
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent className="ml-3 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 flex flex-col items-start justify-center gap-2">
                        {item.submenu.map((subitem, index) => (
                          <Link
                            href={subitem.href}
                            key={index}
                            onClick={() => setIsOpen(false)}
                          >
                            {subitem.label}
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )
                } else {
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      className="text-sm hover:text-muted-foreground transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )
                }
              })}
            </nav>
          </div>
          <div className="flex flex-row items-center justify-between gap-4 w-full">
            <Link href={landing.cta.href} className={cn(buttonVariants(), "w-full")}>{landing.cta.label}</Link>
            <Link href={landing.secondaryCta.href} className={cn(buttonVariants({ variant: "outline" }), "w-full")}>{landing.secondaryCta.label}</Link>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}