"use client"

import { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "@/lib/utils"
import { Icons } from "../Icons"
import { trpc } from "@/lib/trpc/client"
import { Button } from "../ui/button"

interface FavouriteCompanyCardProps extends ComponentPropsWithoutRef<"div"> {
  company: {
    id: string;
    name: string;
    deletedAt: string | null;
  };
  accountId: string;
  onUnfavourite?: () => void;
}

export const FavouriteCompanyCard: FC<FavouriteCompanyCardProps> = ({ company, accountId, className, onUnfavourite, ...props }) => {
  const { mutateAsync: unfavouriteCompany, isLoading: isUnfavouriting } = trpc.company.unfavouriteCompany.useMutation()

  const handleUnfavouriteCompany = async (companyId: string) => {
    await unfavouriteCompany({ companyId, accountId })
    onUnfavourite?.()
  }

  return (
    // <div className={cn("mt-8 flex flex-col gap-6", className)} {...props}>
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <div className="flex items-center gap-2">
        <Icons.building className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">{company.name}</h3>
      </div>
      <Button variant="outline" disabled={isUnfavouriting} size="sm" onClick={() => handleUnfavouriteCompany(company.id)}>
        {isUnfavouriting ? (
          <Icons.spinner className="h-5 w-5 animate-spin" />
        ) : (
          "Remove from Favorites"
        )}
      </Button>
    </div>
  )
}