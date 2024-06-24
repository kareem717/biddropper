"use client";

import { Icons } from "@/components/Icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ComponentPropsWithoutRef, FC, useEffect, useState } from "react";
import { cn } from "@/utils";

export interface QuickSearchProps extends ComponentPropsWithoutRef<typeof Button> {
}

export const QuickSearch: FC<QuickSearchProps> = ({
  className,
  ...props
}) => {
  const [isSearchDialogOpen, setSearchDialogOpen] = useState(false);

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>Sample search query.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
