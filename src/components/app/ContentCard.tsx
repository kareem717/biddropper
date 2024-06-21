"use client";
import Link from "next/link";
import {
  Card
} from "@/components/ui/card";
import { ComponentPropsWithoutRef, FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ContentCardProps extends ComponentPropsWithoutRef<typeof Card> {
  href: string;
  children?: ReactNode;
}

export const ContentCard: FC<ContentCardProps> = ({
  href,
  children,
  className,
  ...props
}) => {
  return (
    <Link href={href}>
      <Card
        className={cn(
          "md:aspect-square hover:scale-105 transition-all ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </Link>
  );
};