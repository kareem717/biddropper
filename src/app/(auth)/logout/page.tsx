"use client";

import { LogoutForm } from "@/components/auth/LogoutForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import redirects from "@/config/redirects";

export default function LogoutPage() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    router.push(redirects.auth.login);
  }

  return (
    <div className="mx-auto w-full max-w-[350px]">
      <LogoutForm />
    </div>
  );
}
