"use client";

import { ComponentPropsWithoutRef, FC, useState, useEffect } from "react";
import { Icons } from "../Icons";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "../providers/AuthProvider";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";

interface JobAnalyticLineProps extends ComponentPropsWithoutRef<"div"> {
  jobId: string;
}

export const JobAnalyticLine: FC<JobAnalyticLineProps> = ({ className, jobId, ...props }) => {
  const { account } = useAuth();
  if (!account) {
    throw new Error("No account");
  }

  const { data, isLoading, isError, refetch, isRefetching, error } = trpc.analytics.GetPublicMonthlyAnalyticsByJobId.useQuery({ jobId },{
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });
  const { mutate: favouriteJob } = trpc.job.favouriteJob.useMutation();
  const { mutate: unfavouriteJob } = trpc.job.unfavouriteJob.useMutation();
  const { data: isJobFavouritedByAccountId, refetch: refetchIsJobFavouritedByAccountId } = trpc.job.getIsJobFavouritedByAccountId.useQuery({ jobId, accountId: account.id },{
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  const [favourited, setFavourited] = useState<boolean>(false);

  useEffect(() => {
    if (isJobFavouritedByAccountId) {
      setFavourited(true);
    } else {
      setFavourited(false);
    }
  }, [isJobFavouritedByAccountId]);

  if (isError) {
    toast.error("There was a error loading job analytics", {
      description: error.message,
      action: {
        label: "Try again",
        onClick: () => refetch()
      }
    })
  }

  const handleFavourite = () => {
    if (favourited) {
      unfavouriteJob({ jobId, accountId: account.id });
    } else {
      favouriteJob({ jobId, accountId: account.id });
    }

    setFavourited(!favourited);
    refetchIsJobFavouritedByAccountId();
  }

  return (
    <>
      {isLoading || isRefetching ? (
        <Skeleton className="w-full h-12" />
      ) : data && (
        <div {...props} className={cn("flex flex-row justify-between items-center gap-4", className)}>
          <div className="flex flex-row gap-1 items-center">
            <Icons.heart className={cn(favourited && "text-red-600 fill-current")} onClick={handleFavourite} />
            <p>{favourited ? Number(data.favorites) + 1 : data.favorites}</p>
            <p>favorites</p>
          </div>
          <div className="flex flex-row gap-1 items-center">
            <p>{data.views}</p>
            <p>views</p>
          </div>
          <div className="flex flex-row gap-1 items-center">
            <p>{data.bids}</p>
            <p>bids</p>
          </div>
        </div>
      )}
    </>
  );
};

