"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { FC, ComponentPropsWithoutRef, useState } from "react";
import { Icons } from "../Icons";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Industry, useIndustrySelect } from "@/lib/hooks/useIndustrySelect";

export interface IndustrySelectProps extends ComponentPropsWithoutRef<typeof Command> {
  onIndustriesSelect?: (industries: Industry[]) => void;
}

export const IndustrySelect: FC<IndustrySelectProps> = ({ className, onIndustriesSelect, ...props }) => {
  const { selectedIndustries, setSelectedIndustries } = useIndustrySelect();

  const { data: industries, isLoading, isError } = trpc.industry.getIndustries.useQuery();

  if (isError) {
    toast.error("Failed to fetch industries!", {
      description: "Please try again later."
    });
  }

  const handleSelect = (industry: Industry) => {
    setSelectedIndustries(selectedIndustries.includes(industry) ? selectedIndustries.filter((i) => i.id !== industry.id) : [...selectedIndustries, industry])
    onIndustriesSelect && onIndustriesSelect(selectedIndustries)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {selectedIndustries && selectedIndustries.length > 0
            ? `${selectedIndustries.length} selected`
            : "Select industry..."}
          <Icons.chevronUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search industry..." />
          {selectedIndustries.length > 0 && (
            <Button variant="secondary" onClick={() => setSelectedIndustries([])}>Clear</Button>
          )}
          <CommandList>
            <CommandEmpty>No industry found.</CommandEmpty>
            <CommandGroup>
              {isLoading ?
                <CommandItem>Loading...</CommandItem>
                : industries && industries.map((industry) => (
                  <CommandItem
                    key={industry.id}
                    value={industry.id}
                    onSelect={() => handleSelect(industry)}
                  >
                    <Icons.check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedIndustries.includes(industry) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {industry.name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};