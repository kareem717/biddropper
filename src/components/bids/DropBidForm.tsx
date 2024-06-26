import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useAuth } from "../providers/AuthProvider";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ComponentPropsWithoutRef, useState } from "react";
import { Icons } from "../Icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useIndustrySelect } from "@/lib/hooks/useIndustrySelect";
import { NewBidSchema } from "@/lib/validations/bid";
import { Textarea } from "../ui/textarea";

const formSchema = NewBidSchema

export interface DropBidFormProps extends ComponentPropsWithoutRef<"form"> {
  jobId: string
}

export const DropBidForm = ({ jobId, ...props }: DropBidFormProps) => {
  const { account, user } = useAuth()

  if (!account || !user) {
    throw new Error("Account or user not found")
  }

  const { data: ownedCompanies, isLoading: isOwnedCompaniesLoading } = trpc.company.getOwnedCompanies.useQuery();

  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { getSelectedIndustries } = useIndustrySelect();

  const { mutateAsync: createBid, isLoading, isError } = trpc.bid.createBid.useMutation({
    onError: () => {
      toast.error("Something went wrong!", {
        description: "Please try again later."
      });
    },
  })

  // @ts-ignore
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      senderCompanyId: ownedCompanies?.[0]?.id,
      jobId: jobId,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading) {
      toast.info("Please wait...", {
        description: "We're creating your bid."
      });
      return;
    }

    const id = await createBid(values);
    if (!isError) {
      toast.success("Bid created!", {
        description: "We've created your bid and added it to your dashboard."
      });

      router.push(`/bids/${id}`);
    }
  }
  const handleValidate = async () => {
    await form.trigger()
    console.log(form.formState.errors)
  }
  return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" {...props}>
        <FormField
          control={form.control}
          name="priceUsd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bid Note</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {(ownedCompanies?.length || 0) > 1 && (
          <FormField
            control={form.control}
            name="senderCompanyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sender Company</FormLabel>

                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sender Company" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownedCompanies?.map((company) => (
                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  This is the company on whose behalf you are sending the bid.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button className="w-full mt-8" type="submit" disabled={isLoading}>
          {isLoading ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Drop Bid"}
        </Button>
      </form>

      <Button className="w-full mt-8" onClick={() => handleValidate()}>
        validate
      </Button>
    </Form >
  );
};