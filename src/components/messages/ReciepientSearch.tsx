"use client"

import {
  useState,
  ComponentPropsWithoutRef,
  FC,
  useRef,
} from "react"
import { cn } from "@/lib/utils"
import { Icons } from "../Icons"
import { trpc } from "@/lib/trpc/client"
import {
  MultiSelector,
  MultiSelectorTrigger,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/app/MultiSelect"
import { titleCase } from "title-case"
import { Command } from "cmdk"

export interface ReciepientSearchProps extends ComponentPropsWithoutRef<typeof MultiSelectorInput> {
  onValuesChange?: (values: { id: string, name: string, type: string }[]) => void;
}

export const ReciepientSearch: FC<ReciepientSearchProps> = ({ className, onValuesChange, ...props }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const { data, refetch, isFetching } = trpc.message.getReciepientsByKeyword.useQuery({ keyword: searchTerm }, {
    enabled: searchTerm.length > 0,
  })
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleSearch = (value: string) => {
    setSearchTerm(value)

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    debounceTimeout.current = setTimeout(() => {
      refetch()
    }, 300)

    props.onValueChange?.(value)
  }

  return (
    <MultiSelector shouldFilter={false} loop
      values={selectedItems}
      onValuesChange={(values) => {
        setSelectedItems(values)
        onValuesChange?.(values.map((value) => {
          const [id, name, type] = value.split(":")
          return { id, name, type }
        }))
      }}
    >
      <MultiSelectorTrigger className="relative w-full border-2 rounded-md "
        valueTransformer={(value) => {
          const [id, name, type] = value.split(":")
          return name
        }}>
        <MultiSelectorInput
          placeholder="Search for recipients..."
          {...props}
          className={cn("pr-10", className)}
          value={searchTerm}
          onValueChange={handleSearch}
        />
        <Icons.search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      </MultiSelectorTrigger>
      <MultiSelectorContent>
        <MultiSelectorList commandEmpty={false}>
          {isFetching ? (
            <Command.Loading className="px-3 py-2 flex items-center justify-center">
              <Icons.spinner className="w-4 h-4 animate-spin" />
            </Command.Loading>
          ) : (data ?? []).length === 0 ? (
            <Command.Empty className="px-3 py-2 flex items-center justify-center">
              <span className="text-muted-foreground">No results found</span>
            </Command.Empty>
          ) : (data ?? []).map((option) => {
            return (
              <MultiSelectorItem
                key={option.id}
                value={`${option.id}:${option.name}:${option.type}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm font-medium">{option.name}</div>
                  <div className="text-xs text-muted-foreground">{titleCase(option.type)}</div>
                </div>
              </MultiSelectorItem>
            )
          })}
        </MultiSelectorList>
      </MultiSelectorContent>
    </MultiSelector>
  )
}