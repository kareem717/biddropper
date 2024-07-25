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
import { ComponentPropsWithoutRef } from "react";
import { Icons } from "../Icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NewBidSchema } from "@/lib/db/queries/validation";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { useCompany } from "../providers/CompanyProvider";

const formSchema = NewBidSchema

export interface DropBidFormProps extends ComponentPropsWithoutRef<"form"> {
  jobId: string
  onSubmitProp?: (values: z.infer<typeof formSchema>) => void;
}

export const DropBidForm = ({ jobId, onSubmitProp, className, ...props }: DropBidFormProps) => {
  const { account, user } = useAuth()
  const { companies } = useCompany()
  const router = useRouter();

  const { mutateAsync: createBid, isLoading, isError } = trpc.bid.createBid.useMutation({
    onError: () => {
      toast.error("Something went wrong!", {
        description: "Please try again later."
      });
    },
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      senderCompanyId: companies[0]?.id,
      jobId: jobId,
    },
  })

  if (!account || !user) {
    throw new Error("Account or user not found")
  }

  if (companies.length === 0) {
    throw new Error("No companies found")
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    onSubmitProp?.(values);
    if (isLoading) {
      toast.info("Please wait...", {
        description: "We're creating your bid."
      });
      return;
    }

    const id = await createBid(values);
    onSubmitProp?.(values);
    if (!isError) {
      toast.success("Bid created!", {
        description: "We've created your bid and added it to your dashboard."
      });

      router.push(`/bids/${id}`);
    }
  }

  return (
    <Form {...form} >
      <form  {...props} onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-8", className)}>
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
                <Textarea {...field} value={field.value || ""} className="max-h-32" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="senderCompanyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sender Company</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={companies.length < 2}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sender Company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
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
        <Button className="w-full mt-8" type="submit" disabled={isLoading}>
          {isLoading ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Drop Bid"}
        </Button>
      </form>
    </Form >
  );
};