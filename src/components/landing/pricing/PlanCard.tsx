"use client"

import { Icons } from "@/components/Icons"
import { Button } from "@/components/ui/button"
import { Plan } from "@/config/pricing"
import { cn } from "@/utils"
import { ComponentPropsWithoutRef } from "react"


export interface PricingCardProps extends ComponentPropsWithoutRef<'div'> {
  isAnnual: boolean
  plan: Plan
}

export const PricingCard = ({ className, isAnnual, plan, ...props }: PricingCardProps) => {
  return (
    <div className={cn("rounded-lg border shadow-sm flex flex-col justify-between items-center gap-4 py-6 w-72 h-[400px]", plan.highlight && "bg-muted-foreground/5 scale-110 mx-3", className)} {...props}>
      <div className="px-6 flex flex-col gap-2 items-start justify-start w-full">
        <h2 className="text-lg font-medium leading-6 text-primary">{plan.name}</h2>
        <p className="mt-8">
          <span className="text-4xl font-bold tracking-tight">${isAnnual ? plan.price.annual : plan.price.monthly}</span>{" "}
          <span className="text-base font-medium text-muted-foreground">/month</span>
        </p>
        <p className="mt-4 text-sm  text-muted-foreground">{plan.description}</p>
      </div>
      <div className="px-6 flex flex-col gap-2 items-start justify-start w-full">
        <ul role="list" className="flex flex-col gap-2">
          {plan.featureSummary.map((feature, index) => (
            <li className="flex space-x-3" key={index}>
              <Icons.check className="h-5 w-5 flex-shrink-0 text-primary/80" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-4 flex justify-center w-full">
        <Button className="w-full">{plan.cta}</Button>
      </div>
    </div>
  )
}
