"use client";

import { ComponentPropsWithoutRef, FC, useState, useEffect } from "react";
import { Icons } from "../Icons";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "../providers/AuthProvider";

interface JobAnalyticLineProps extends ComponentPropsWithoutRef<"div"> {
  jobId: string;
}

export const JobAnalyticLine: FC<JobAnalyticLineProps> = ({ className, jobId, ...props }) => {
  const { account } = useAuth();
  if (!account) {
    throw new Error("No account");
  }

  const { data, isLoading } = trpc.analytics.GetPublicMonthlyAnalyticsByJobId.useQuery({ jobId });
  const { mutate: favouriteJob } = trpc.job.favouriteJob.useMutation();
  const { mutate: unfavouriteJob } = trpc.job.unfavouriteJob.useMutation();
  const { data: isJobFavouritedByAccountId, refetch: refetchIsJobFavouritedByAccountId } = trpc.job.getIsJobFavouritedByAccountId.useQuery({ jobId, accountId: account.id });

  const [favourited, setFavourited] = useState<boolean>(false);

  useEffect(() => {
    if (isJobFavouritedByAccountId) {
      setFavourited(true);
    } else {
      setFavourited(false);
    }
  }, [isJobFavouritedByAccountId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data</div>;
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
    <div {...props} onClick={handleFavourite} className={cn("flex flex-row justify-between items-center gap-4", className)}>
      <div className="flex flex-row gap-1 items-center">
        <Icons.heart className={cn(favourited && "text-red-600 fill-current")} />
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
  );
};

