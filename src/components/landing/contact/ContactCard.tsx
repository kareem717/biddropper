"use client"

import { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "@/utils"
import { ContactForm } from "./ContactForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import contact from "@/config/landing/contact"

export interface ContactCardProps extends ComponentPropsWithoutRef<typeof Card> {}

export const ContactCard: FC<ContactCardProps> = ({ className, ...props }) => {
  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader>
        <CardTitle>{contact.title}</CardTitle>
        <CardDescription>{contact.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ContactForm />
      </CardContent>
    </Card>
  )
}