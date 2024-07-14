"use client";

import { Icons } from "../Icons";
import { Button } from "../ui/button";
import { createClient } from "@/lib/utils/supabase/client";
import { useRouter } from "next/navigation";
import { env } from "@/lib/env.mjs";
import { ComponentPropsWithoutRef, FC, useState } from "react";

export type OAuthProvider = "google" | "github";

export interface OAuthButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  provider: OAuthProvider;
  isLoading: string | null;
  handleLogin: (provider: OAuthProvider) => void;
}

export const OAuthButton: FC<OAuthButtonProps> = ({ provider, isLoading, handleLogin, ...props }) => (
  <Button className="w-full" variant="secondary" onClick={() => handleLogin(provider)} disabled={isLoading === provider} {...props}>
    {
      isLoading === "github" ? <Icons.spinner className="w-4 h-4 animate-spin" /> : <Icons.github className="w-4 h-4" />
    }
  </Button>
);

export const OAuthButtons: FC<{ providers: OAuthProvider[], disabled?: boolean }> = ({ providers, disabled }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (provider: OAuthProvider) => {
    setIsLoading(provider);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,

      options: {
        redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    });

    if (error) {
      throw error
    } else {
      router.push(data.url)
    }
    setIsLoading(null);
  };

  return (

    <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
      {providers.map((provider) => (
        <OAuthButton key={provider} provider={provider} isLoading={isLoading} handleLogin={handleLogin} disabled={disabled} />
      ))}
    </div>
  );
};
