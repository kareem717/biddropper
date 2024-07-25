"use client"

import { ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';
import { ShowCompany } from '@/lib/db/queries/validation';

export type CompanyContextType = {
  companies: ShowCompany[]
};

const CompanyContext = createContext<CompanyContextType>({
  companies: [],
});

export function useCompany() {
  return useContext(CompanyContext);
}

export default function CompanyProvider({ children, companies }: { children: ReactNode, companies: ShowCompany[] }) {
  return <CompanyContext.Provider value={{ companies }}>{children}</CompanyContext.Provider>;
}