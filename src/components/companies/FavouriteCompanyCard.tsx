"use client"

import { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "@/lib/utils"
import { Icons } from "../Icons"
import { trpc } from "@/lib/trpc/client"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

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
  const { mutateAsync: unfavouriteCompany, isLoading: isUnfavouriting, isError } = trpc.company.unfavouriteCompany.useMutation({
    onError: (error) => {
      toast.error("Uh oh!", {
        description: error.message
      })
    }
  })

  const handleUnfavouriteCompany = async (companyId: string) => {
    await unfavouriteCompany({ companyId, accountId })
    if (!isError) {
      onUnfavourite?.()
      toast.success("Company removed from favorites")
    }
  }

  return (
    <div className={cn("flex justify-between items-center gap-4 rounded-md border shadow-sm p-4", className)} {...props}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Icons.building className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{company.name}</h3>
        </div>
      </div>
      <Tooltip>
        <TooltipTrigger>
          <Button variant="outline" disabled={isUnfavouriting} size="sm" onClick={() => handleUnfavouriteCompany(company.id)}>
            {isUnfavouriting ? (
              <Icons.spinner className="h-5 w-5 animate-spin" />
            ) : (
              <Icons.close className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Remove from favorites
        </TooltipContent>
      </Tooltip>
    </div>
  )
}