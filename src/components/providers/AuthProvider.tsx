"use client"

import { ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';
import { Account as DbAccount } from '@/lib/db/types';

export type Account = DbAccount | null
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

export default function AuthProvider({ children, user, account }: { children: ReactNode, user: User | null, account: Account | null }) {
  return <AuthContext.Provider value={{ user, account }}>{children}</AuthContext.Provider>;
}