"use client"

import { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Icons } from "../Icons"

export interface HistoryCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string
  href: string
  type: "job" | "company"
}

export const HistoryCard: FC<HistoryCardProps> = ({ className, name, href, type, ...props }) => {
  const Icon = type === "job" ? Icons.gavel : Icons.building
  return (
    <div className={cn("p-4 rounded-lg bg-card border shadow-sm flex justify-between items-center", className)} {...props}>
      <Icon className="w-10 h-10 text-muted-foreground" />
      <Link href={href}>
        <h3 className="text-lg font-medium">{name}</h3>
      </Link>
    </div>
  )
}
