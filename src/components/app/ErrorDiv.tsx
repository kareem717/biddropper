"use client";

import { ComponentPropsWithoutRef, FC } from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/Icons";
import { Button } from "@/components/ui/button";

export interface ErrorDivProps extends ComponentPropsWithoutRef<'div'> {
  retry?: () => void;
  isRetrying?: boolean;
  retriable?: boolean;
  message?: string;
}

export const ErrorDiv: FC<ErrorDivProps> = ({
  retry,
  isRetrying,
  retriable,
  message,
  className,
  ...props
}) => {

  const handleRetry = () => {
    retry?.();
  };

  return (
    <div className={cn("flex flex-col items-center justify-center w-full h-full", className)} {...props}>
      <div className="flex flex-col items-center justify-center gap-2 w-1/4 min-w-[200px] max-w-md">
        <Icons.alert className="h-16 w-16 text-muted-foreground stroke-[1.5px] animate-pulse" />
        <span className="text-sm text-muted-foreground text-center text-wrap">
          {message || "An error occurred"}
        </span>
        {retriable && (
          <Button onClick={handleRetry} disabled={isRetrying} className="w-full" >
            {isRetrying ? <Icons.spinner className="h-4 w-4 mr-2" /> : null}
            Retry
          </Button>
        )}
      </div>
    </div>
  );
};