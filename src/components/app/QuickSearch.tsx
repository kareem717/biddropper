"use client";

import { Icons } from "@/components/Icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ComponentPropsWithoutRef, FC, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { toast } from "sonner";

export interface QuickSearchProps extends ComponentPropsWithoutRef<typeof Button> {
  onSearch: (query: string) => void;
}

export const QuickSearch: FC<QuickSearchProps> = ({
  className,
  onSearch,
  ...props
}) => {
  const [isSearchDialogOpen, setSearchDialogOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === "k") {
        event.preventDefault();
        setSearchDialogOpen(true);
      } else if (event.key === "Enter" && isSearchDialogOpen) {
        event.preventDefault();
        if (query.trim() !== "") {
          onSearch(query);
          setSearchDialogOpen(false);
        } else {
          toast.error("Please enter something to search");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchDialogOpen, query, onSearch]);

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
          <DialogTitle>Quick search</DialogTitle>
        </DialogHeader>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button className="w-full" onClick={() => onSearch(query)}>Search</Button>
      </DialogContent>
    </Dialog>
  );
};
