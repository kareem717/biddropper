"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import { ComponentPropsWithoutRef, FC } from "react"
import { Icons } from "@/components/Icons"
import { Image as ImageType } from "@/config/types"

export interface FeatureCardProps extends ComponentPropsWithoutRef<'div'> {
  image: ImageType
  header: string
  description: string
  points: {
    name: string
    description: string
    icon: keyof typeof Icons
  }[]
  orientation?: "left" | "right"
}

export const FeatureCard: FC<FeatureCardProps> = ({ className, image, header, description, points, orientation = "left", ...props }) => {
  return (
    <div className={cn("overflow-hidden py-12 sm:py-24", className)} {...props}>
      <div className="p-4 mx-auto max-w-7xl">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2" dir={orientation === "left" ? "ltr" : "rtl"}>
          <div className={cn("my-auto pl-8")}>
            <div className="lg:max-w-lg" dir="ltr">
              <p className="text-3xl font-semibold">
                {header}
              </p>
              <p className=" mt-6 text-lg font-medium text-muted-foreground">
                {description}
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 lg:max-w-none">
                {points.map((point, index) => {
                  const Icon = Icons[point.icon]
                  return (
                    <div className="relative pl-9" key={index}>
                      <dt className="inline font-semibold">
                        <Icon className="absolute top-1 h-5 w-5 text-primary/80 left-1" aria-hidden="true" />
                        {point.name}
                      </dt>
                      <dd className="inline text-muted-foreground ml-2">
                        {point.description}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          </div>
          <Image src={image.src} width={image.width} height={image.height} className={cn("w-[48rem] max-w-none rounded-xl border shadow-xl sm:w-[48rem]", orientation === "left" ? "md:-ml-4 lg:-ml-0" : "md:-mr-4 lg:-mr-0")} alt={image.alt} />
        </div>
      </div>
    </div>
  )
}
