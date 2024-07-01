"use client";

import { Icons } from "@/components/Icons";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ComponentPropsWithoutRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import { AddressDisplay } from "../app/AddressDisplay";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { titleCase } from "title-case";
import { ShowAddress } from "@/lib/validations/address";

export interface CompanyIndexCardProps extends ComponentPropsWithoutRef<typeof Card> {
  companyId: string;
}

export const CompanyIndexCard = ({ companyId, className, ...props }: CompanyIndexCardProps) => {
  const router = useRouter();
  const { data: company, isLoading } = trpc.company.getCompanyFull.useQuery({ id: companyId })
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

  if (isLoading) return <div>Loading...</div>
  if (!company) return <div>Company not found</div>

  return (
    <Card className={cn("overflow-hidden flex flex-col justify-between hover:scale-105 focus-within:scale-105 md:hover:scale-110 md:focus-within:scale-110 transition-all duration-150", className)} {...props}>
      <CardHeader className="flex justify-between flex-row items-center">
        <CardTitle>{company.name}</CardTitle>
        {/* <div className="grid grid-cols-2 gap-2">
          <Link href={`/companies/${companyId}/edit`}>
            <Icons.edit className="w-5 h-5 text-muted-foreground" />
          </Link>
          <button onClick={onDelete} disabled={deleting}>
            {deleting ? <Icons.spinner className="w-5 h-5 animate-spin" /> : <Icons.trash className="w-5 h-5 text-muted-foreground" />}
          </button>
        </div> */}
        <Badge variant={company.isVerified ? "default" : "outline"}>{company.isVerified ? "Verified" : "Unverified"}</Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap  mx-auto py-2">
          {company.industries.map((industry, index) => (
            <Badge key={index}>
              {titleCase(industry.name)}
            </Badge>
          ))}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <AddressDisplay address={company.address as ShowAddress} />
      </CardContent>
      <CardFooter className="bg-primary px-6 py-4">
        <Link href={`/companies/${companyId}`} className="text-background font-semibold">View Details</Link>
      </CardFooter>
    </Card>
  )
};

