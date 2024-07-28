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
import { ComponentPropsWithoutRef, useState, FC } from "react";
import { Icons } from "../Icons";
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea";
import { useCompany } from "../providers/CompanyProvider";
import { NewMessageSchema } from "@/lib/db/queries/validation";
import { cn } from "@/lib/utils";
import { ReciepientSearch } from "./ReciepientSearch";

const formSchema = NewMessageSchema

export interface CreateMessageFormProps extends ComponentPropsWithoutRef<"form"> {
  onSubmitProp?: (values: z.infer<typeof formSchema>) => void;
  replyTo?: {
    messageId: string;
    recipient: {
      id: string;
      type: "account" | "company";
    };
  }[];
}

export const CreateMessageForm: FC<CreateMessageFormProps> = ({ className, onSubmitProp, replyTo, ...props }) => {
  const { account, user } = useAuth()
  const { companies: ownedCompanies } = useCompany()
  if (!account || !user) {
    throw new Error("Account or user not found")
  }

  const { mutateAsync: createMessage, isLoading, isError } = trpc.message.createMessage.useMutation({
    onError: () => {
      toast.error("Something went wrong!", {
        description: "Please try again later."
      });
    },
  })

  const isReply = replyTo && replyTo.length > 0

  // @ts-ignore
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      senderAccountId: account.id,
      replyTo: isReply ? replyTo.map((r) => r.messageId) : undefined,
      recipients: isReply ? replyTo.reduce((acc, r) => {
        acc.accountIds.push(...replyTo.filter((rec) => rec.recipient.type === "account").map((rec) => rec.recipient.id));
        acc.companyIds.push(...replyTo.filter((rec) => rec.recipient.type === "company").map((rec) => rec.recipient.id));
        return acc;
      }, { accountIds: [] as string[], companyIds: [] as string[] }) : undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading) {
      toast.info("Please wait...", {
        description: "We're creating your job."
      });
      return;
    }

    const id = await createMessage(values);
    onSubmitProp?.(values);

    if (!isError) {
      toast.success("Message created!", {
        description: "Your message was sent"
      });
    }
  }


  return (
    <Form {...form}>
      <form {...props} onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-8 max-h-[50vh] overflow-y-auto", className)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormDescription>
                Enter a detailed description of the job.
              </FormDescription>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {ownedCompanies && ownedCompanies.length === 1 ? (
          <FormField
            control={form.control}
            name="senderCompanyId"
            render={({ field: { value } }) => (
              <FormItem>
                <FormControl>
                  <div className="items-top flex space-x-2">
                    <Checkbox
                      id="terms1"
                      onCheckedChange={(val) => {
                        if (val) {
                          form.setValue("senderAccountId", form.getValues("senderAccountId") ? undefined : account.id);
                          form.setValue("senderCompanyId", ownedCompanies[0]?.id);
                        } else {
                          form.setValue("senderAccountId", account.id);
                          form.setValue("senderCompanyId", undefined);
                        }
                      }}
                      checked={form.getValues("senderCompanyId") === ownedCompanies[0]?.id}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms1"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Send on behalf of {ownedCompanies[0]?.name}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {ownedCompanies[0]?.name} will be mentioned as a sender in the message, alogside your account.
                      </p>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : ownedCompanies && ownedCompanies.length > 1 ? (
          <FormField
            control={form.control}
            name="senderCompanyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send on behalf of</FormLabel>
                <FormDescription>
                  Select if you want to send this message on behalf of a company you own.
                </FormDescription>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      if (value === "") {
                        form.setValue("senderAccountId", account.id);
                        form.setValue("senderCompanyId", undefined);
                      } else {
                        form.setValue("senderCompanyId", value);
                        form.setValue("senderAccountId", undefined);
                      }
                    }}
                    defaultValue={field.value || undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Company Name" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel className="text-muted-foreground">
                          Companies
                        </SelectLabel>
                        {ownedCompanies.map((company) => (
                          <SelectItem
                            key={company.name}
                            value={company.id}
                          >
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : undefined}
        {!isReply && (
          <FormField
            control={form.control}
            name="recipients"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipients</FormLabel>
                <FormDescription>
                  Search for the recipients of the message.
                </FormDescription>
                <FormControl>
                  <ReciepientSearch onValuesChange={(values) => {
                    const companyIds: string[] = []
                    const accountIds: string[] = []

                    values.map((val) => {
                      if (val.type === "account") {
                        accountIds.push(val.id)
                      } else {
                        companyIds.push(val.id)
                      }
                    })

                    form.setValue("recipients", {
                      accountIds,
                      companyIds
                    })
                  }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </form>
      <Button className="w-full mt-8" onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
        {isLoading ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Create Company"}
      </Button>
    </Form >
  );
};