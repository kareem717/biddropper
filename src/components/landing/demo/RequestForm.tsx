"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { cn } from "@/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FC, ComponentPropsWithoutRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import demo from "@/config/demo"
import { trpc } from "@/lib/trpc/client"
import { toast } from "sonner"
import { Icons } from "@/components/Icons"

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }).max(400, {
    message: "First name must be less than 400 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }).max(400, {
    message: "Last name must be less than 400 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }).max(400, {
    message: "Email must be less than 400 characters.",
  }),
  companyName: z.string().min(1, {
    message: "Company name must be at least 1 character.",
  }).max(300, {
    message: "Company name must be less than 300 characters.",
  }),
  role: z.string().max(100, {
    message: "Role must be less than 100 characters.",
  }),
  interestedIn: z.array(z.enum(demo.requestForm.interestedInOptions.map(option => option.value) as [string, ...string[]])),
  useCase: z.string().max(10000, {
    message: "Use case must be less than 10,000 characters.",
  }),
  heardFrom: z.string().max(500, {
    message: "Heard from must be less than 500 characters.",
  })
})

export type DemoRequestFormValues = z.infer<typeof formSchema>
export const DemoRequestFormSchema = formSchema


export interface DemoRequestFormProps extends ComponentPropsWithoutRef<"form"> {
  onFormSubmit?: (values: z.infer<typeof formSchema>) => void
}

export const DemoRequestForm: FC<DemoRequestFormProps> = ({ className, onFormSubmit, ...props }) => {
  const { mutateAsync, isLoading } = trpc.email.submitDemoRequest.useMutation({
    onError: () => {
      toast.error("Something went wrong!", {
        description: "Please try again later."
      });
    },
    onSuccess: () => {
      toast.success("Thank you!", {
        description: "We got your message! We will review your request and get back to you shortly."
      });
    },
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await mutateAsync(values)
    onFormSubmit?.(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-8 max-h-[70vh] overflow-y-auto px-2", className)} {...props}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interestedIn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Which products are you interested in?</FormLabel>
              <FormControl>
                <ToggleGroup type="multiple" onValueChange={field.onChange} defaultValue={field.value}>
                  {demo.requestForm.interestedInOptions.map(option => (
                    <ToggleGroupItem key={option.value} value={option.value} className="w-full">{option.label}</ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="useCase"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What are you looking to use biddropper for?</FormLabel>
              <FormControl>
                <Textarea placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="heardFrom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Where did you hear about us?</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Icons.spinner className="h-4 w-4 animate-spin" /> : "Submit"}
        </Button>
      </form>
    </Form>
  )
}
