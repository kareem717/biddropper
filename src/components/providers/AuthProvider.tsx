"use client"
import { ReactNode } from 'react';
import { accounts } from '@/lib/db/migrations/schema';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { InferSelectModel } from 'drizzle-orm';
import { createContext, useContext } from 'react';

export type Account = InferSelectModel<typeof accounts> | null
export type User = SupabaseUser | null
export type AuthContextType = {
  user: User
  account: Account
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  account: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children, user, account }: { children: ReactNode, user: User | null, account: InferSelectModel<typeof accounts> | null }) {
  return <AuthContext.Provider value={{ user, account }}>{children}</AuthContext.Provider>;
}