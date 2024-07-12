"use client"

import { Icons } from "@/components/Icons"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/utils"
import Image from "next/image"
import Link from "next/link"
import { ComponentPropsWithoutRef } from "react"

export interface FeatureHeroProps extends ComponentPropsWithoutRef<'div'> {
  title: string
  description: string
}

export const FeatureHero = ({ className, title, description, ...props }: FeatureHeroProps) => {
  return (
    <div className="relative mx-auto flex max-w-7xl flex-col justify-center px-4 pt-20 sm:px-6 sm:pt-36 lg:px-0">
      <div className="relative z-30 flex flex-col items-center text-center">
        <h1 className="md:text-5xl text-3xl max-w-4xl">
          {title}
        </h1>
        <p className="text-xl mt-9 max-w-2xl font-medium leading-normal lg:text-xl">
          {description}
        </p>
        <div className="z-30 mt-12 flex w-full flex-col items-center justify-center space-y-4 px-4 sm:flex-row sm:space-y-0">
          <Link className={cn(buttonVariants(), "w-full sm:w-auto flex items-center justify-center gap-2")} href="https://auth.featurebase.app/register">
            <Icons.arrowUpRight className="w-4 h-4" />
            Sign up for free
          </Link>
          <Link className={cn(buttonVariants({ variant: "secondary" }), "w-full sm:ml-4 sm:w-auto")} href="/demo">
            See it in action
          </Link>
        </div>
      </div>
      <div className="absolute inset-0 bottom-0 h-full transform-gpu rounded-full opacity-15 blur-[80px] lg:h-[1000px] bg-gradient-to-r from-primary to-accent top-[200px] sm:top-[450px]" />
      <div className="parent-right big-rounded relative mx-auto mt-16 max-w-[1200px] sm:mt-28">
        <div className="absolute -inset-2 rounded-xl opacity-[12%] sm:-inset-3 sm:rounded-2xl bg-gradient-to-r from-primary to-accent" />
        <div className="relative">
          <Image
            alt="The Featurebase feedback portal showing already received user feedback."
            src="https://www.featurebase.app/images/redesign/public_roadmap.jpg"
            width="3321"
            height="2103"
            decoding="async"
            data-nimg="1"
            className=" rounded-xl border border-gray-7000 bg-[#171a24] shadow-2xl sm:rounded-xl"
          />
        </div>
      </div>
    </div >
  )
}
