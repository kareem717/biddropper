"use client"

import { trpc } from "@/lib/trpc/client"
import { cn, timeSince } from "@/utils"
import { ComponentPropsWithoutRef } from "react"
import { Badge } from "@/components/ui/badge"
import { titleCase } from "title-case"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"

export interface LandingHeroProps extends ComponentPropsWithoutRef<'div'> {
}


export const LandingHero = ({ className, ...props }: LandingHeroProps) => {
  return (
    <section>
      Hero
    </section>
  )
}