"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { EditCompanySchema } from "@/lib/db/queries/validation"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import useRadiusMap from "@/lib/hooks/useRadiusMap";
import { IndustrySelect } from "../app/IndustrySelect";
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
import { ComponentPropsWithoutRef, FC, useState, useEffect } from "react";
import { Icons } from "../Icons";
import { useIndustrySelect } from "@/lib/hooks/useIndustrySelect";
import dynamic from "next/dynamic";
import { ErrorDiv } from "@/components/app/ErrorDiv";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = EditCompanySchema

const RadiusAddressMap = dynamic(() => import("@/components/maps/RadiusAddressMap"), { ssr: false });

export interface EditCompanyFormProps extends ComponentPropsWithoutRef<"form"> {
  companyId: string
  onSubmitProp?: (values: z.infer<typeof formSchema>) => void;
}

export const EditCompanyForm: FC<EditCompanyFormProps> = ({ companyId, className, onSubmitProp, ...props }) => {

  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setAddress, getAddress } = useRadiusMap();
  const { getSelectedIndustries, setSelectedIndustries } = useIndustrySelect();
  const {
    data: company,
    isLoading:
    isCompanyLoading,
    isError: isCompanyError,
    error: companyError,
    refetch,
    isRefetching,
    errorUpdateCount
  } = trpc.company.getCompanyFull.useQuery({ id: companyId }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false
  });

  const { mutateAsync: editCompany, isLoading, isError } = trpc.company.editCompany.useMutation({
    onError: (error) => {
      toast.error("Something went wrong!", {
        description: error.message
      });
    },
  })

  // @ts-ignore
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...company,
      address: getAddress()
    },
  })

  useEffect(() => {
    if (company) {
      // Wrap in useEffect to ensure that the hook is not called more than once
      setSelectedIndustries(company.industries);
      const { rawJson, ...addressWithoutRawJson } = company.address;

      setAddress(addressWithoutRawJson);
    }
  }, [company, setSelectedIndustries, setAddress]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading) {
      toast.info("Please wait...", {
        description: "We're creating your company."
      });
      return;
    }

    const id = await editCompany(values);
    onSubmitProp?.(values);

    if (!isError) {
      toast.success("Company created!", {
        description: "We've created your company and added it to your dashboard."
      });

      router.push(`/my-companies/${id}`);
    }
  }

  const handleConfirmDialog = async () => {
    await form.trigger()
    if (form.formState.isValid) {
      setIsDialogOpen(true);
    }
  }

  return (
    <>
      {isCompanyError ? (
        <ErrorDiv message={companyError?.message} isRetrying={isCompanyLoading} retry={refetch} retriable={errorUpdateCount < 3} className="w-full h-full" />
      ) : isCompanyLoading || isRefetching ? (
        <Skeleton className="w-full h-[80vh]" />
      ) : (
        <Form {...form}>
          <form {...props} onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-8", className)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Example Construction LTD" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the public display name of your company.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col md:flex-row gap-8">
              <FormField
                control={form.control}
                name="emailAddress"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is will be provided to people trying to contact your company, so you should use a active email that is checked.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="416-123-4567" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is will be provided to people trying to contact your company.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="www.example.com" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    This will be displayed on your company profile
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col md:flex-row gap-8">
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
                name="dateFounded"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel>Date Founded</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(e) => {
                            field.onChange(e?.toISOString() || "")
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The approximate date of your company&#39;s founding. Use the most official date possible.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormDescription>
                Select the address where your company headquarters are located, and the radius of your service area relative to that point.
              </FormDescription>
              <FormControl>
                <RadiusAddressMap defaultAddress={getAddress()} defaultRadius={Number(company.serviceArea)} addressInputProps={{
                  onRetrieve: (address) => {
                    form.setValue("address", address);
                  }
                }} labelSliderProps={{
                  onValueChange: (value) => {
                    form.setValue("serviceArea", value[0].toString());
                  }
                }} className="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </form>
          <Button className="w-full mt-8" onClick={handleConfirmDialog} disabled={isLoading}>
            {isLoading ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Save Company"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  Please double check the information below before creating the company, and ensure that it is correct.
                </DialogDescription>
              </DialogHeader>
              <Button type="button" className="w-full" onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
                {isLoading ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Edit Company"}
              </Button>
            </DialogContent>
          </Dialog>
        </Form>
      )}
    </>
  )
}