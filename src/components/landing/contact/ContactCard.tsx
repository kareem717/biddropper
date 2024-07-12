"use client"

import { ComponentPropsWithoutRef } from "react"
import { cn } from "@/utils"
import { ContactForm } from "./ContactForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import contact from "@/config/contact"

export interface ContactCardProps extends ComponentPropsWithoutRef<typeof Card> {
}

export const ContactCard = ({ className, ...props }: ContactCardProps) => {
  return (
    <Card className={cn("w-full", className)}>
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