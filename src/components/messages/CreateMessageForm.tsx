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
import { NewJobSchema } from "@/lib/validations/job"
import { format } from "date-fns"
import { cn } from "@/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { useState } from "react";
import { Icons } from "../Icons";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
import { CustomRadioButtons } from "@/components/app/CustomRadioButtons"
import { AutoFillMap } from "@/components/maps/AutoFillMap"
import { IndustrySelect } from "../app/IndustrySelect";
import { useIndustrySelect } from "@/lib/hooks/useIndustrySelect";
import { useAutoFillMap } from "@/lib/hooks/useAutoFillMap";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCompany } from "../providers/CompanyProvider";
import { NewMessageSchema } from "@/lib/validations/message";

const formSchema = NewMessageSchema

export const CreateMessageForm = () => {
  const { account, user } = useAuth()
  const { companies: ownedCompanies } = useCompany()
  if (!account || !user) {
    throw new Error("Account or user not found")
  }

  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { getSelectedIndustries } = useIndustrySelect();

  const { mutateAsync: createMessage, isLoading, isError } = trpc.message.createMessage.useMutation({
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
      senderAccountId: account.id,
      senderCompanyId: ownedCompanies.length > 0 ? ownedCompanies[0].id : undefined,
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
    if (!isError) {
      toast.success("Job created!", {
        description: "We've created your job and added it to your dashboard."
      });

      router.push(`/company/${id}`);
    }
  }

  const handleConfirmDialog = async () => {
    await form.trigger()
    console.log(form.formState.isValid)
    if (form.formState.isValid) {
      setIsDialogOpen(true);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-h-[50vh] overflow-y-auto">
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
                        form.setValue(
                          "senderCompanyId",
                          val ? ownedCompanies[0]?.id : undefined,
                        );
                      }}
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
                        form.setValue("senderCompanyId", undefined);
                      } else {
                        form.setValue("senderCompanyId", value);
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
      </form>
      <Button className="w-full mt-8" onClick={handleConfirmDialog} disabled={isLoading}>
        {isLoading ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Create Company"}
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          {JSON.stringify(form.getValues())}
          <Button type="button" className="w-full" onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Create Company"}
          </Button>
        </DialogContent>
      </Dialog>
    </Form >
  );
};