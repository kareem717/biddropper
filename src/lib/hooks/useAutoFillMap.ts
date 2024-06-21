import { create } from "zustand";
import * as z from "zod";
import { createAddressInput } from "@/lib/validations/server/address";
import { type Address } from "./useAddressInput";

interface useAutoFillMapProps {
  address: Address | undefined;
  setAddress: (address: Address | undefined) => void;
}

const useAutoFillMap = create<useAutoFillMapProps>((set, get) => ({
  address: undefined,
  setAddress: (address: Address | undefined) => {
    set((state) => ({
      ...state,
      address,
    }));
  },
}));

export default useAutoFillMap;
