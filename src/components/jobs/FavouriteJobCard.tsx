"use client"

import { ComponentPropsWithoutRef, FC } from "react"
import { cn, truncate } from "@/lib/utils"
import { Icons } from "../Icons"
import { trpc } from "@/lib/trpc/client"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

interface FavouriteJobCardProps extends ComponentPropsWithoutRef<"div"> {
  job: {
    id: string;
    title: string;
    description: string;
    deletedAt: string | null;
  };
  accountId: string;
  onUnfavourite?: () => void;
}

export const FavouriteJobCard: FC<FavouriteJobCardProps> = ({ job, accountId, className, onUnfavourite, ...props }) => {
  const { mutateAsync: unfavouriteJob, isLoading: isUnfavouriting, isError } = trpc.job.unfavouriteJob.useMutation({
    onError: (error) => {
      toast.error("Uh oh!", {
        description: error.message
      })
    }
  })

  const handleUnfavouriteJob = async (jobId: string) => {
    await unfavouriteJob({ jobId, accountId })
    if (!isError) {
      onUnfavourite?.()
      toast.success("Job removed from favorites")
    }
  }

  return (
    <div className={cn("flex justify-between items-center gap-4 rounded-md border shadow-sm p-4", className)} {...props}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Icons.briefcase className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{job.title}</h3>
        </div>
        <p className="text-muted-foreground">
          {truncate(job.description, 100)}
        </p>
      </div>
      <Tooltip>
        <TooltipTrigger>
          <Button variant="outline" disabled={isUnfavouriting} size="sm" onClick={() => handleUnfavouriteJob(job.id)}>
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