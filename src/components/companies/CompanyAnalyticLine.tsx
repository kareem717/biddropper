"use client";

import { ComponentPropsWithoutRef, FC, useState, useEffect } from "react";
import { Icons } from "../Icons";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "../providers/AuthProvider";

interface CompanyAnalyticLineProps extends ComponentPropsWithoutRef<"div"> {
  companyId: string;
}

export const CompanyAnalyticLine: FC<CompanyAnalyticLineProps> = ({ className, companyId, ...props }) => {
  const { account } = useAuth();
  if (!account) {
    throw new Error("No account");
  }

  const { data, isLoading } = trpc.analytics.GetPublicMonthlyAnalyticsByCompanyId.useQuery({ companyId });
  const { mutate: favouriteCompany } = trpc.company.favouriteCompany.useMutation();
  const { mutate: unfavouriteCompany } = trpc.company.unfavouriteCompany.useMutation();
  const { data: isCompanyFavouritedByAccountId, refetch: refetchIsCompanyFavouritedByAccountId } = trpc.company.getIsCompanyFavouritedByAccountId.useQuery({ companyId, accountId: account.id });

  const [favourited, setFavourited] = useState<boolean>(false);

  useEffect(() => {
    if (isCompanyFavouritedByAccountId) {
      setFavourited(true);
    } else {
      setFavourited(false);
    }
  }, [isCompanyFavouritedByAccountId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  const handleFavourite = () => {
    if (favourited) {
      unfavouriteCompany({ companyId, accountId: account.id });
    } else {
      favouriteCompany({ companyId, accountId: account.id });
    }

    setFavourited(!favourited);
    refetchIsCompanyFavouritedByAccountId();
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
    </div>
  );
};

