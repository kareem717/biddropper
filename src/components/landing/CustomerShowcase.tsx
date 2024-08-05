"use client"

import { ComponentPropsWithoutRef, FC } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Icons } from "../Icons"
import { useTheme } from "next-themes"
import { Image as ImageType } from "@/config/types"

export type Customer = {
  name: string
  image: ImageType
  href?: string
}

export interface ShowcaseCardProps extends ComponentPropsWithoutRef<'div'> {
  customer: Customer
}

export const CustomerShowcaseCard: FC<ShowcaseCardProps> = ({ customer }) => {
  const { resolvedTheme } = useTheme()
  return (
    <div className="relative h-8 flex-1">
      {customer.href ?
        (<Link href={customer.href} legacyBehavior >
          <Image
            alt={`Customer logo: ${customer.name}`}
            src={customer.image.src}
            decoding="async"
            width={customer.image.width}
            height={customer.image.height}
            data-nimg="fill"
            className={cn("mx-auto absolute h-full w-full inset-0", resolvedTheme === "light" && "filter invert")}
            loading="lazy"
          />
        </Link>
        ) : (
          <Image
            alt={`Customer logo: ${customer.name}`}
            src={customer.image.src}
            decoding="async"
            width={customer.image.width}
            height={customer.image.height}
            data-nimg="fill"
            className={cn("mx-auto absolute h-full w-full inset-0", resolvedTheme === "light" && "filter invert")}
            loading="lazy"
          />
        )}
    </div>
  )
}

export interface CustomerShowcaseProps extends ComponentPropsWithoutRef<'div'> {
  customers: Customer[]
}

export const CustomerShowcase: FC<CustomerShowcaseProps> = ({ className, customers, ...props }) => {
  return (
    <div className={cn(className)} {...props}>
      <p className="text-center font-semibold text-muted-foreground tracking-widest capitalize">
        COMPANIES OF ALL SIZES <Icons.heart className="w-5 h-5 text-primary fill-current inline" /> BIDDROPPER
      </p>
      <div className={cn("grid transform grid-cols-2 md:grid-cols-4 items-center gap-12 sm:items-start px-4 py-10 sm:pt-12 max-w-sm md:max-w-4xl mx-auto", className)} {...props}>
        {customers.map((customer) => (
          <CustomerShowcaseCard key={customer.name} customer={customer} />
        ))}
      </div>
    </div>
  )
}