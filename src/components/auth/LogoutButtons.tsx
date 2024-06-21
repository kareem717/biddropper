"use client";

import { Button } from "../ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner"
import { useState } from "react";
import { Icons } from "../Icons";

export const LogoutButtons = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Uh oh! Something went wrong. Please try again.")
    } else {
      router.push("/")
    }

    setIsLoading(false);
  };

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
      <Button className="w-full" variant="secondary" onClick={handleLogout} disabled={isLoading}>
        {
          isLoading ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Logout"
        }
      </Button>
      <Button className="w-full" variant="default" onClick={() => router.back()} disabled={isLoading}>Go back</Button>
    </div>
  );
};
