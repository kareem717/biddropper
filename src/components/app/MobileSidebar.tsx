"use client";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";
import { Button } from "../ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Icons } from "@/components/Icons"
import { usePathname } from "next/navigation";

export interface MobileSidebarProps extends ComponentPropsWithoutRef<typeof Sheet> {
  contentProps?: ComponentPropsWithoutRef<typeof SheetContent>;
  triggerProps?: ComponentPropsWithoutRef<typeof SheetTrigger>;
}

export const MobileSidebar = ({ contentProps, triggerProps, ...props }: MobileSidebarProps) => {
  const { className, ...otherContentProps } = contentProps || {};
  const pathname = usePathname();
  console.log(pathname);
  return (
    <Sheet {...props}>
      <SheetTrigger asChild {...triggerProps}>
        <Button variant="outline">
          <Icons.menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" {...otherContentProps} className={cn(className)}>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you&#39;re done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
       
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
