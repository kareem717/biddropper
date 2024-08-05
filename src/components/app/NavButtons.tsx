"use client"

import { buttonVariants } from "../ui/button"
import { Icons } from "@/components/Icons"
import { ComponentPropsWithoutRef, FC, useState } from "react"
import { useAuth } from "../providers/AuthProvider"
import { ScrollArea } from "../ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { timeSince } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import Link from "next/link"
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
import { trpc } from "@/lib/trpc/client"
import { Textarea } from "../ui/textarea"
import { titleCase } from "title-case"
import { toast } from "sonner"
import { ErrorDiv } from "../app/ErrorDiv"
import { Skeleton } from "../ui/skeleton"
import redirects from "@/config/redirects"

export interface FeedbackFormProps extends ComponentPropsWithoutRef<"form"> {
  onSubmit?: () => void
}

export const FeedbackForm: FC<FeedbackFormProps> = ({ className, onSubmit: onSubmitProp, ...props }) => {
  const { user } = useAuth()
  const { mutate: sendEmail, isLoading } = trpc.email.submitFeedback.useMutation({
    onError: (error) => {
      toast.error("Uh oh!", {
        description: "A error occurred while sending your feedback. Please try again later.",
      })
    },
    onSuccess: () => {
      toast.success("Thank you!", {
        description: "Your feedback has been sent. We will review it and get back to you soon if necessary.",
      })

      onSubmitProp?.()
    }
  })

  const feedbackFormSchema = z.object({
    email: z.string().email(),
    message: z.string(),
  })

  const form = useForm<z.infer<typeof feedbackFormSchema>>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      email: user?.email || "",
      message: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof feedbackFormSchema>) => {
    if (isLoading) {
      toast.info("Please wait...")
      return
    }

    await sendEmail(values)
  }

  return (
    <Form {...form}>
      <form {...props} onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="example@host.com" {...field} />
              </FormControl>
              <FormDescription>
                A reply will be sent to this email address.
              </FormDescription>
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
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Submit"}
        </Button>
      </form>
    </Form>
  )

}

export interface HelpFormProps extends ComponentPropsWithoutRef<"form"> {
  onSubmit?: () => void
}

export const HelpForm: FC<HelpFormProps> = ({ className, onSubmit: onSubmitProp, ...props }) => {
  const { user } = useAuth()
  const { mutateAsync: sendEmail, isLoading } = trpc.email.submitSupportRequest.useMutation({
    onError: (error) => {
      toast.error("Uh oh!", {
        description: "A error occurred while sending your support request. Please try again later.",
      })
    },
    onSuccess: () => {
      toast.success("Thank you!", {
        description: "Your support request has been sent. We will review it and get back to you soon.",
      })

      onSubmitProp?.()
    }
  })

  const helpFormSchema = z.object({
    email: z.string().email(),
    message: z.string().min(10, { message: "Message must be at least 10 characters" }).max(1000, { message: "Message must be less than 1000 characters" }),
  })

  const form = useForm<z.infer<typeof helpFormSchema>>({
    resolver: zodResolver(helpFormSchema),
    defaultValues: {
      email: user?.email || "",
      message: "",
    },
  })

  // 2. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof helpFormSchema>) => {
    if (isLoading) {
      toast.info("Please wait...")
      return
    }

    await sendEmail(values)


  }

  return (
    <Form {...form}>
      <form {...props} onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="example@host.com" {...field} />
              </FormControl>
              <FormDescription>
                A reply will be sent to this email address.
              </FormDescription>
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
              <FormDescription>
                Please provide a detailed description of your issue.
              </FormDescription>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Submit"}
        </Button>
      </form>
    </Form>
  )
}

export interface InboxProps extends ComponentPropsWithoutRef<typeof Card> {
  accountId: string
}

export const Inbox: FC<InboxProps> = ({ accountId, className, ...props }) => {
  const [readNotificationId, setReadNotificationId] = useState<string[]>([])

  const { data: res, isLoading, error, isError, refetch, isRefetching, errorUpdateCount } = trpc.message.getReceivedMessagesByAccountId.useQuery({
    accountId,
  }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false
  })

  const { mutate: readNotification } = trpc.message.readMessage.useMutation()


  const handleNotificationFocus = (message: any) => {
    if (message.description.length > 25) return
    if (readNotificationId.includes(message.id)) return
    setReadNotificationId([...readNotificationId, message.id])
    readNotification({ messageId: message.id, recipient: { accountId } })
  }

  const data = res?.data

  return (
    <Card className={cn("shadow-none border-0", className)} {...props}>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have {data?.length || 0} unread messages.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 w-full p-4">
        {isError ? (
          <ErrorDiv message={error?.message} retry={refetch} isRetrying={isRefetching} retriable={errorUpdateCount < 3} className="w-48 h-64" />
        ) : isLoading || isRefetching ? (
          <Skeleton className="w-48 h-96" />
        ) : (
          data?.slice(0, 3).map((message) => (
            <Link
              className="flex items-start gap-3 rounded-lg border border-border py-2 px-4 w-full"
              key={message.id}
              href={redirects.inbox}
              // href={`/inbox/${message.id}`} //TODO: implement 
              onFocus={() => handleNotificationFocus(message)}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-start">
                  {!readNotificationId.includes(message.id) && (
                    <div className="h-2 w-2 bg-primary rounded-full mt-1" />
                  )}
                  <p className="font-medium">{titleCase(message.title)}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {message.description.substring(0, 25)}
                  {message.description.length > 25 ? "..." : ""}
                </p>
                <p className="text-sm text-muted-foreground">{timeSince(new Date(message.createdAt))}</p>
              </div>
            </Link>
          )))}
        {data?.length && data.length > 3 && (
          <Link className="text-sm text-muted-foreground" href="/inbox">
            View all
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

export const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
        <span>Feedback</span>
      </PopoverTrigger>
      <PopoverContent className="max-w-lg p-4 mx-4">
        <FeedbackForm onSubmit={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}

export interface InboxButtonProps extends ComponentPropsWithoutRef<"div"> {
  accountId: string
}

export const InboxButton: FC<InboxButtonProps> = ({ accountId }) => {
  const { data } = trpc.message.getUnreadMessageCountByAccountId.useQuery({
    accountId,
  })

  return (
    <Popover>
      <PopoverTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
        <div className="relative w-full h-full flex items-center justify-center">
          <Icons.inbox className="w-4 h-4" />
          {data?.count && data.count > 0 && (
            <div className="absolute -top-[5px] -right-[15px]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="mx-4">
        <Inbox accountId={accountId} />
      </PopoverContent>
    </Popover>
  )
}

export const HelpButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
        <Icons.circleHelp className="w-4 h-4" />
      </PopoverTrigger>
      <PopoverContent className="max-w-lg p-4 mx-4">
        <HelpForm onSubmit={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}