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
import { EditJob, EditJobSchema, } from "@/lib/validations/job"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
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
import { ComponentPropsWithoutRef, FC, useState } from "react";
import { Icons } from "../Icons";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { CustomRadioButtons } from "@/components/app/CustomRadioButtons"
import { AutoFillMap } from "@/components/maps/AutoFillMap"
import { IndustrySelect } from "../app/IndustrySelect";
import { useIndustrySelect } from "@/lib/hooks/useIndustrySelect";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { useAutoFillMap } from "@/lib/hooks/useAutoFillMap";

const formSchema = EditJobSchema

export interface EditJobFormProps extends ComponentPropsWithoutRef<"form"> {
  job: EditJob
}

export const EditJobForm: FC<EditJobFormProps> = ({ job, className, ...props }) => {
  const { account, user } = useAuth()
  const { data: ownedCompanies, isLoading: isOwnedCompaniesLoading } = trpc.company.getOwnedCompanies.useQuery();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { getSelectedIndustries, setSelectedIndustries } = useIndustrySelect();
  const { setAddress } = useAutoFillMap();
  const { mutateAsync: editJob, isLoading, isError } = trpc.job.editJob.useMutation({
    onError: () => {
      toast.error("Something went wrong!", {
        description: "Please try again later."
      });
    },
  })

  if (!account || !user) {
    throw new Error("Account or user not found")
  }


  // @ts-ignore
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: job,
  })

  useEffect(() => {
    // Wrap in useEffect to ensure that the hook is not called more than once
    setSelectedIndustries(job.industries);
    setAddress(job.address);
  }, [job.industries, setSelectedIndustries, job.address, setAddress]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading) {
      toast.info("Please wait...", {
        description: "We're creating your job."
      });
      return;
    }

    const id = await editJob(values);
    if (!isError) {
      toast.success("Job updated!", {
        description: "We've updated your job."
      });

      router.push(`/company/${id}`);
    }
  }

  const handleConfirmDialog = async () => {
    await form.trigger()
    if (form.formState.isValid) {
      setIsDialogOpen(true);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-8 max-h-[50vh] overflow-y-auto", className)} {...props}>
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
        <FormField
          control={form.control}
          name="propertyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type</FormLabel>
              <FormDescription>
                Which one of these porperty types is closest to the
                property this job for?
              </FormDescription>
              <FormControl>
                <CustomRadioButtons
                  {...field}
                  className="mx-auto my-6 flex h-full w-full max-w-md flex-row items-center justify-between gap-8"
                  onValueChange={(value) => {
                    form.setValue("propertyType", value as any);
                  }}
                  defaultValue={job.propertyType}
                  buttons={[
                    {
                      icon: Icons.home as any,
                      label: "Detached",
                      value: "detached",
                    },
                    {
                      icon: Icons.building as any,
                      label: "Apartment",
                      value: "apartment",
                    },
                    {
                      icon: Icons.building2 as any,
                      label: "Semi-Detached",
                      value: "semi-detached",
                    },
                  ]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isCommercialProperty"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="items-top flex space-x-2">
                  <Checkbox
                    id="commercial"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="commercial"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Is this a commercial property?
                    </label>
                    <p className="text-sm text-muted-foreground">
                      If this property is used to conduct business, or
                      is owned by a business, then select this option.
                    </p>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem className="flex flex-col w-full">
          <FormLabel>Industries</FormLabel>
          <FormControl>
            <IndustrySelect onIndustriesSelect={(_industries) => {
              form.setValue("industries", getSelectedIndustries());
            }} />
          </FormControl>
          <FormDescription>
            Select all industries that your company operates in.
          </FormDescription>
          <FormMessage />
        </FormItem>
        <FormField
          control={form.control}
          name="startDateFlag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>When do you want this job to start?</FormLabel>
              <FormControl>
                <FormControl>
                  <RadioGroup
                    defaultValue={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      if (val !== "none") {
                        form.setValue("startDate", "");
                      }
                    }}
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <div className="items-top flex space-x-2">
                        <FormControl>
                          <RadioGroupItem value="none" id="none" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor="none"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Around this date
                            </Label>
                            <FormField
                              control={form.control}
                              name="startDate"
                              render={({ field: subField }) => (
                                <FormItem>
                                  <FormControl>
                                    <Popover>
                                      <PopoverTrigger
                                        asChild
                                        disabled={
                                          field.value !== "none"
                                        }
                                      >
                                        <FormControl>
                                          <Button
                                            variant={"outline"}
                                            className={cn(
                                              "w-[240px] pl-3 text-left font-normal",
                                              !subField.value &&
                                              "text-muted-foreground",
                                            )}
                                          >
                                            {subField.value ? (
                                              format(
                                                new Date(subField.value),
                                                "PPP",
                                              )
                                            ) : (
                                              <span>Pick a date</span>
                                            )}
                                            <Icons.calendar className="ml-auto h-4 w-4 opacity-50" />
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="w-auto p-0 z-30"
                                        align="start"
                                      >
                                        <Calendar
                                          mode="single"
                                          selected={
                                            subField.value ? new Date(subField.value) : undefined
                                          }
                                          onSelect={(date) => {
                                            if (
                                              date
                                            ) {
                                              subField.onChange(date.toISOString());
                                            } else {
                                              subField.onChange(null);
                                            }
                                          }}
                                          disabled={(date) =>
                                            date < new Date()
                                          }
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </FormLabel>
                      </div>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <div className="items-top flex space-x-2">
                        <FormControl>
                          <RadioGroupItem
                            value="flexible"
                            id="flexible"
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor="flexible"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Flexible
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              I don&#39;t have a specific date in mind,
                              and am flexible on when this job can be
                              done.
                            </p>
                          </div>
                        </FormLabel>
                      </div>
                    </FormItem>

                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <div className="items-top flex space-x-2">
                        <FormControl>
                          <RadioGroupItem value="urgent" id="urgent" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor="urgent"
                              className="font-me`dium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Urgently
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              I need this job done as soon as possible,
                              and I am willing to pay a premium to get
                              it done.
                            </p>
                          </div>
                        </FormLabel>
                      </div>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormDescription>
                Please select an address from the suggestions below.
              </FormDescription>
              <FormControl className="mt-2">
                <AutoFillMap defaultAddress={job.address} addressInputProps={{
                  onRetrieve: (address) => {
                    form.setValue("address", address);
                  }
                }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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