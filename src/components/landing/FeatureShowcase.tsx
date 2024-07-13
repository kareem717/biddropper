"use client"

import { ComponentPropsWithoutRef, FC } from "react"
import Link from "next/link"
import Image from "next/image"
import { Icons } from "../Icons"
import { buttonVariants } from "../ui/button"
import { cn } from "@/utils"
import { Image as ImageType } from "@/config/types"

export type Feature = {
  title: string
  description: string
  image: ImageType
  learnMoreLink: string
}

export interface ShowcaseCardProps extends ComponentPropsWithoutRef<'div'> {
  feature: Feature
  arrow?: "top" | "bottom"
}

export const FeatureShowcaseCard: FC<ShowcaseCardProps> = ({ feature, arrow }) => {
  return (
    <div className="relative">
      <div className="featured-card relative h-[340px] overflow-hidden rounded-xl sm:h-[390px] bg-card">
        <div className="relative h-full">
          <div className="mb-2 p-6 lg:p-8">
            <h3 className="max-w-lg text-xl font-medium text-foreground/80 lg:text-2xl">{feature.title}</h3>
            <p className="mt-4 text-sm text-muted-foreground lg:text-base max-w-md">{feature.description}</p>
          </div>
          <div className="relative mr-4 h-full rounded-tr-lg border-t border-r shadow-xl ">
            <Image alt={feature.image.alt} src={feature.image.src} width={feature.image.width} height={feature.image.height} decoding="async" data-nImage="1" className="absolute inset-0 rounded-tr-lg shadow-2xl" loading="lazy" />
          </div>
        </div>
        <Link href={feature.learnMoreLink} className={cn(buttonVariants({ variant: "ghost" }), "z-20 rounded-full text-muted-foreground/80 transform-gpu shadow-xl shadow-background/15 backdrop-blur-sm backdrop-brightness-150 backdrop-contrast-[115%] hover:bg-white/20 absolute bottom-4 right-4")}>
          Learn more
          <Icons.arrowUpRight className="ml-1.5 h-4 w-4" />
        </Link>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-card/80" />
      </div>
      {arrow === "bottom" && (
        <svg className="absolute -right-14 -bottom-10 hidden h-5 transform text-muted-foreground/50 lg:block" viewBox="0 0 193 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_3_254)">
            <path d="M173.928 21.1292C115.811 44.9386 58.751 45.774 0 26.1417C4.22669 21.7558 7.81938 23.4266 10.5667 24.262C31.7002 29.9011 53.4676 30.5277 75.0238 31.3631C106.09 32.6162 135.465 25.5151 164.207 14.0282C165.475 13.6104 166.532 12.775 169.068 11.1042C154.486 8.18025 139.903 13.1928 127.223 7.34485C127.435 6.50944 127.435 5.46513 127.646 4.62971C137.156 4.00315 146.877 3.37658 156.388 2.54117C165.898 1.70575 175.196 0.661517 184.706 0.0349538C191.68 -0.382755 194.639 2.9589 192.103 9.22453C188.933 17.3698 184.495 24.8886 180.48 32.6162C180.057 33.4516 179.423 34.4959 178.578 34.9136C176.253 35.749 173.928 35.9579 171.392 36.5845C170.97 34.4959 169.913 32.1985 170.124 30.3188C170.547 27.8126 172.026 25.724 173.928 21.1292Z" fill="currentColor">
            </path>
          </g>
          <defs>
            <clipPath id="clip0_3_254"><rect width="193" height="40" fill="white">
            </rect>
            </clipPath>
          </defs>
        </svg>
      )}
      {arrow === "top" && (
        <svg className="absolute -right-14 -top-10 hidden h-5 transform text-muted-foreground/50 lg:block" viewBox="0 0 193 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_3_254)">
            <path d="M173.928 18.8708C115.811 -4.93858 58.751 -5.77404 0 13.8583C4.22669 18.2442 7.81938 16.5734 10.5667 15.738C31.7002 10.0989 53.4676 9.47232 75.0238 8.6369C106.09 7.38378 135.465 14.4849 164.207 25.9718C165.475 26.3896 166.532 27.225 169.068 28.8958C154.486 31.8198 139.903 26.8072 127.223 32.6551C127.435 33.4906 127.435 34.5349 127.646 35.3703C137.156 35.9969 146.877 36.6234 156.388 37.4588C165.898 38.2943 175.196 39.3385 184.706 39.965C191.68 40.3828 194.639 37.0411 192.103 30.7755C188.933 22.6302 184.495 15.1114 180.48 7.38383C180.057 6.54841 179.423 5.50413 178.578 5.08642C176.253 4.251 173.928 4.04211 171.392 3.41555C170.97 5.50409 169.913 7.80148 170.124 9.68117C170.547 12.1874 172.026 14.276 173.928 18.8708Z" fill="currentColor">
            </path>
          </g>
          <defs>
            <clipPath id="clip0_3_254">
              <rect width="193" height="40" fill="white" transform="matrix(1 0 0 -1 0 40)">
              </rect>
            </clipPath>
          </defs>
        </svg>
      )}
    </div>
  )
}

export interface FeatureShowcaseProps extends ComponentPropsWithoutRef<'div'> {
  features: Feature[]
}

export const FeatureShowcase: FC<FeatureShowcaseProps> = ({ className, features, ...props }) => {
  return (
    <div className={cn("relative mx-auto max-w-7xl", className)} {...props}>
      <div className="grid gap-6 lg:grid-cols-3 px-4">
        {features.slice(0, 3).map((feature, index) => (
          <FeatureShowcaseCard
            key={index}
            feature={feature}
            arrow={index === 2 ? undefined : index % 2 ? "bottom" : "top"}
          />
        ))}
      </div>
    </div>
  )
}