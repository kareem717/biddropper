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
import { toast } from "sonner"
import { Icons } from "@/components/Icons"
import { trpc } from "@/lib/trpc/client"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(400, {
    message: "Name must be less than 400 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }).max(400, {
    message: "Email must be less than 400 characters.",
  }),
  message: z.string().max(10000, {
    message: "Message must be less than 10,000 characters.",
  }),

})

export interface ContactFormProps extends ComponentPropsWithoutRef<"form"> {
  onFormSubmit?: (values: z.infer<typeof formSchema>) => void
}

export const ContactForm: FC<ContactFormProps> = ({ className, onFormSubmit, ...props }) => {
  const { mutateAsync, isLoading } = trpc.email.submitContactUs.useMutation({
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Message" {...field} />
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
