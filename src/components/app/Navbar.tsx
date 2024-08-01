import { ComponentPropsWithoutRef } from "react";
import { FeedbackButton, InboxButton, HelpButton } from "./NavButtons";
import { MobileSidebar } from "./MobileSidebar";

export interface NavbarProps extends ComponentPropsWithoutRef<"div"> {
  accountId: string
}

export const Navbar = ({ accountId, ...props }: NavbarProps) => {
  return (
    <div className="bg-background h-12 flex flex-row justify-between items-center" {...props}>
      <div className="flex flex-row justify-start md:justify-between items-center w-full gap-6">
        <MobileSidebar />
        <div className="flex-row justify-center items-center gap-2 hidden md:flex">
          <FeedbackButton />
          <InboxButton accountId={accountId} />
          <HelpButton />
        </div>
      </div>
    </div>
  );
}

