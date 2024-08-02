"use client"

import { ComponentPropsWithoutRef } from "react"
import Link from "next/link"
import landing from "@/config/landing"

export interface LandingFooterProps extends ComponentPropsWithoutRef<'div'> {}

export const LandingFooter = ({ className, ...props }: LandingFooterProps) => {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        © 2024 Yakubu LLC. All rights reserved.
      </p>
    </footer>
  )
}