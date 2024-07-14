"use client"

import { FC, useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  value?: Date
  defaultDate?: Date
  onSelect?: (date: Date) => void
}


export const DatePicker: FC<DatePickerProps> = ({ defaultDate, onSelect, value, ...props }) => {
  const [date, setDate] = useState<Date | undefined>(value || defaultDate)

  const handleDateChange = (date?: Date) => {
    if (date) {
      setDate(date)
      onSelect?.(date)
    }
  }

  return (
    <Popover>
      <PopoverTrigger className={cn(buttonVariants({ variant: "outline" }), "w-[280px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "PPP") : <span>Pick a date</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          initialFocus
          {...props}
          selected={date}
          onSelect={handleDateChange}
        />
      </PopoverContent>
    </Popover>
  )
}
