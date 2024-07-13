"use client"

import { ComponentPropsWithoutRef, useState } from "react"
import { PricingCard } from "./PlanCard"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import pricing from "@/config/landing/pricing"
import { cn } from "@/utils"

export interface PricingHeroProps extends ComponentPropsWithoutRef<'div'> {}

export const PricingHero = ({ className, ...props }: PricingHeroProps) => {
  const [isAnnual, setIsAnnual] = useState(true)

  return (
    <div className={cn("flex flex-col gap-6 md:gap-8 w-full items-center justify-center", className)} {...props}>
      <div className="px-4 pb-4 sm:px-0 text-center space-y-4 md:space-y-8">
        <h1 className="md:text-5xl text-3xl mx-auto max-w-3xl">{pricing.hero.title}</h1>
        <h2 className="md:text-xl max-w-lg mx-auto">{pricing.hero.description}</h2>
      </div>
      <div className="flex flex-col items-center justify-center md:gap-16 gap-8">
        <ToggleGroup className="w-36" type="single" onValueChange={(value) => setIsAnnual(value === "annual")} defaultValue="annual">
          <ToggleGroupItem className="w-full" value="monthly">Monthly</ToggleGroupItem>
          <ToggleGroupItem className="w-full" value="annual">Annual</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex gap-7 md:gap-4 flex-col md:flex-row items-center justify-center">
          {pricing.plans.map((plan, index) => (
            <PricingCard key={index} isAnnual={isAnnual} plan={plan} />
          ))}
        </div>
      </div>
    </div>
  )
}