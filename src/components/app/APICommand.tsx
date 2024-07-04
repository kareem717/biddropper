"@use client"
import { Command as CommandPrimitive } from "cmdk"
import {
  Command as ShadCNCommand,
  CommandEmpty,
  CommandGroup,
  CommandItem as ShadCNCommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { ComponentPropsWithoutRef, FC, useState, useEffect, useCallback } from "react"
import { cn } from "@/utils"
import { Icons } from "../Icons"

export interface CommandItem {
  title: string
  onClick?: () => void
}
export interface CommandProps extends ComponentPropsWithoutRef<typeof ShadCNCommand> {
  searchFunc: (query: string) => Promise<CommandItem[]>
}

export const APICommand: FC<CommandProps> = ({ className, searchFunc, ...props }) => {
  const [search, setSearch] = useState<string>("")
  const [results, setResults] = useState<CommandItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const handleSearch = useCallback(async () => {
    if (loading) return
    setLoading(true)
    const res = await searchFunc(search)
    setResults(res)
    setLoading(false)
  }, [search, loading, searchFunc])

  useEffect(() => {
  }, [search])

  // Listen for enter key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [search, loading, handleSearch]);
  return (
    <ShadCNCommand className={cn(className)} {...props}>
      <div className="flex items-center justify-center">
        <div className="flex items-center border-b px-3 group w-full" cmdk-input-wrapper="">
          <Icons.search className="mr-2 h-4 w-4 shrink-0 opacity-50 hidden group-focus-within:block" />
          <CommandPrimitive.Input
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            value={search}
            onValueChange={(e) => setSearch(e)}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <Icons.close className={cn("h-4 w-4 shrink-0 opacity-50 hidden group-focus-within:block", search ? "block" : "hidden")} />
            </button>
          )}
        </div>
        <button className="px-3 border-l border-b h-11 bg-muted flex items-center justify-center" onClick={() => handleSearch()} disabled={loading}>
          <Icons.search className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </div>
      <CommandList>
        {loading ? (
          <div className="flex items-center justify-center min-h-24 ">
            <Icons.spinner className="h-8 w-8 shrink-0 opacity-50 animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Results">
              {results.map((item, index) => (
                <ShadCNCommandItem key={index} onClick={item.onClick}>
                  {item.title}
                </ShadCNCommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
      <CommandSeparator />
    </ShadCNCommand>
  )
}