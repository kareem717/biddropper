"use client"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/utils"
import Link from "next/link"
import { ComponentPropsWithoutRef } from "react"
import FeatureConfig from "@/config/features"

export interface FeatureFooterProps extends ComponentPropsWithoutRef<'div'> {
}

export const FeatureFooter = ({ className, ...props }: FeatureFooterProps) => {
  return (
    <div>
      <div className="relative mx-auto mt-16 max-w-7xl overflow-hidden">
        <div className="mx-auto mb-10 h-px max-w-8xl opacity-15 bg-gradient-to-l from-primary to-background" />
        <div className="absolute  inset-x-0 mx-auto h-full w-[700px] transform-gpu rounded-full bg-gradient-to-r from-primary/10 to-accent/10 blur-[90px]" />
        <div className="relative px-0 sm:px-6 lg:px-8">
          <div className="relative py-20 lg:mx-auto lg:max-w-7xl">
            <div className="relative flex flex-col items-center justify-center space-y-6">
              <div className="text-center space-y-4">
                <h3 className="max-w-2xl text-center text-2xl sm:text-4xl">
                  {FeatureConfig.footer.title}
                </h3>
                <p className="text-center font-normal text-gray-200">
                  {FeatureConfig.footer.description}
                </p>
              </div>
              <div className="flex w-1/3 max-w-80 items-center justify-center gap-3 max-auto">
                <Link href="/demo" className={cn(buttonVariants(), "w-full")}>
                  Sign up for free
                </Link>
                <Link href="/demo" className={cn(buttonVariants({ variant: "secondary" }), "w-full")}>
                  View demo
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 h-px max-w-8xl opacity-15 bg-gradient-to-r from-primary to-accent" />
      </div>
    </div>
  )
}
