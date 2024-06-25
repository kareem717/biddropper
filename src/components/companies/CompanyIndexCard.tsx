"use client";

import { Icons } from "@/components/Icons";
import Link from "next/link";
import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContentCard } from "@/components/app/ContentCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { ComponentPropsWithoutRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface CompanyIndexCardProps extends ComponentPropsWithoutRef<typeof CardContent> {
  companyId: string;
  name: string;
}

export const CompanyIndexCard = ({ companyId, name, className, ...props }: CompanyIndexCardProps) => {
  const router = useRouter();
  const { mutateAsync: deleteCompany, isLoading: deleting } = trpc.company.deleteCompany.useMutation({
    onSuccess: () => {
      toast.success("Company deleted!");
    },
    onError: (error) => {
      toast.error("Uh oh!", {
        description: "There was an error deleting the company.",
      });
    }
  });

  const onDelete = async () => {
    await deleteCompany({ id: companyId });
    router.refresh();
  };

  return (
    <ContentCard href={`/companies/${companyId}`}>
      <CardHeader className="flex justify-between flex-row items-center">
        <CardTitle>{name}</CardTitle>
        <div className="flex flex-row items-center gap-2">
          <Link href={`/companies/${companyId}/edit`} className={buttonVariants()}>
            <Icons.edit className="w-4 h-4 mr-2" />
            <span>Edit</span>
          </Link>
          <Button onClick={onDelete} disabled={deleting} variant={"destructive"}>
            {deleting ? <Icons.spinner className="w-4 h-4 mr-2 animate-spin" /> : <Icons.trash className="w-4 h-4 mr-2" />}
            <span>Delete</span>
          </Button>
        </div>
      </CardHeader>
      <Link href={`/companies/${companyId}`}>
        <CardContent {...props}>
        </CardContent>
      </Link>
    </ContentCard>
  );
};

