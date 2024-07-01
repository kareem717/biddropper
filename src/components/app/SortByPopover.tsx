/**
 * v0 by Vercel.
 * @see https://v0.dev/t/bVLlZ6Ut1Hb
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client"

import { FC, useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { titleCase } from "title-case";
import { Icons } from "../Icons"

export interface SortByPopoverProps {
  sortByOptions: string[]
  onSortChange?: (sortByValue: string | null, sortOrder: "asc" | "desc" | null) => void
}

export const SortByPopover: FC<SortByPopoverProps> = ({ sortByOptions, onSortChange }) => {
  type SortByValue = Extract<typeof sortByOptions[number], string> | null;

  const [sortByValue, setSortByValue] = useState<SortByValue>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)

  const handleSortChange = (field: SortByValue, order: "asc" | "desc" | null) => {
    if (field === null && order === null) {
      setSortByValue(null)
      setSortOrder(null)
    } else {
      setSortByValue(field)
      setSortOrder(order)
    }

    onSortChange?.(sortByValue, sortOrder)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Icons.filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Sort Options</h3>
          <Button
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => handleSortChange(null, null)}
          >
            Clear
          </Button>
        </div>
        <div className="grid gap-2">
          {sortByOptions.map((option) => (
            <div key={option} className="flex items-center justify-between">
              <Label htmlFor={`sort-by-${option}`}>{toTitleCase(option)}</Label>
              <RadioGroup
                id={`sort-by-${option}`}
                value={sortByValue === option ? sortOrder ?? "" : ""}
                onValueChange={(order) => handleSortChange(option, order as "asc" | "desc")}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id={`sort-by-${option}-asc`} value="asc" className="h-4 w-4" />
                  <Label htmlFor={`sort-by-${option}-asc`} className="text-sm">
                    Ascending
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id={`sort-by-${option}-desc`} value="desc" className="h-4 w-4" />
                  <Label htmlFor={`sort-by-${option}-desc`} className="text-sm">
                    Descending
                  </Label>
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}