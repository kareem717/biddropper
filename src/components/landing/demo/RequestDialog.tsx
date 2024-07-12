"use client"
import { ComponentPropsWithoutRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils"
import { DemoRequestForm } from "./RequestForm"
import demo from "@/config/demo"

export interface DemoRequestDialogProps extends ComponentPropsWithoutRef<typeof DialogTrigger> {
}

export const DemoRequestDialog = ({ className, ...props }: DemoRequestDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild className={cn("w-full", className)} {...props}>
        <Button variant="default">
          {demo.cta}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl rounded-lg">
        <DialogHeader>
          <DialogTitle>{demo.requestForm.title}</DialogTitle>
          <DialogDescription>
            {demo.requestForm.description}
          </DialogDescription>
        </DialogHeader>
        <DemoRequestForm />
      </DialogContent>
    </Dialog>
  )
}