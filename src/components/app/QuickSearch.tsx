"use client";

import { Icons } from "@/components/Icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ComponentPropsWithoutRef, FC, useEffect, useState } from "react";
import { cn } from "@/utils";
import { Input } from "../ui/input";

export interface QuickSearchProps extends ComponentPropsWithoutRef<typeof Button> {
  onSearch: (query: string) => void;
}

export const QuickSearch: FC<QuickSearchProps> = ({
  className,
  onSearch,
  ...props
}) => {
  const [searching, setSearching] = useState(false);
  const [isSearchDialogOpen, setSearchDialogOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === "k") {
        event.preventDefault();
        setSearchDialogOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  return (
    <Dialog open={isSearchDialogOpen} onOpenChange={setSearchDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn("text-muted-foreground flex items-center justify-between gap-8 w-full", className)}
          {...props}
        >
          <span className="flex items-center justify-center">
            <Icons.search className="w-4 h-4 mr-2" />
            <span className="inline">Quick search...</span>
          </span>
          <span className="hidden lg:flex items-center justify-center">
            <Icons.command className="w-4 h-4" />K
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="p-8">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account
            and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} disabled={searching} />
        <Button variant="secondary" className="w-full" onClick={() => onSearch(query)} disabled={searching}>{searching ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Search"}</Button>
      </DialogContent>
    </Dialog>
  );
};
