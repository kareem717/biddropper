"use client"

import { ComponentPropsWithoutRef, FC } from "react"
import Link from "next/link"
import { buttonVariants } from "../../ui/button"
import Image from "next/image"
import { Icons } from "@/components/Icons"
import { cn } from "@/lib/utils"
import { CTA, Image as ImageType } from "@/config/types"

export interface LandingHeroProps extends ComponentPropsWithoutRef<'div'> {
  title: string
  description: string
  image: ImageType
  cta: CTA
  secondaryCta: CTA
}

export const LandingHero: FC<LandingHeroProps> = ({ className, title, description, image, cta, secondaryCta, ...props }) => {
  return (
    <div className={cn("relative mx-auto flex max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-0", className)} {...props}>
      <div className="relative z-30 flex flex-col items-center text-center">
        <h1 className="md:text-5xl text-3xl max-w-4xl">
          {title}
        </h1>
        <p className="text-xl mt-9 max-w-2xl font-medium leading-normal lg:text-xl">
          {description}
        </p>
        <div className="z-30 mt-12 flex w-full flex-col items-center justify-center space-y-4 px-4 sm:flex-row sm:space-y-0">
          <Link className={cn(buttonVariants(), "w-full sm:w-auto flex items-center justify-center gap-2")} href={cta.href}>
            <Icons.arrowUpRight className="w-4 h-4" />
            {cta.label}
          </Link>
          <Link className={cn(buttonVariants({ variant: "secondary" }), "w-full sm:ml-4 sm:w-auto")} href={secondaryCta.href}>
            {secondaryCta.label}
          </Link>
        </div>
      </div>
      <div className="absolute inset-0 bottom-0 h-full transform-gpu rounded-full opacity-15 blur-[80px] lg:h-[1000px] bg-gradient-to-r from-primary to-accent top-[200px] sm:top-[450px]" />
      <div className="parent-right big-rounded relative mx-auto mt-16 max-w-[1200px] sm:mt-28">
        <div className="absolute -inset-2 rounded-xl opacity-[12%] sm:-inset-3 sm:rounded-2xl bg-gradient-to-r from-primary to-accent" />
        <div className="relative">
          <Image
            alt={image.alt}
            src={image.src}
            width={image.width}
            height={image.height}
            decoding="async"
            data-nimg="1"
            className="rounded-xl border bg-primary shadow-2xl sm:rounded-xl"
          />
        </div>
      </div>
    </div >
  )
}