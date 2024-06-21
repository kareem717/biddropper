import { create } from "zustand";
import * as z from "zod";
import { addressInsertSchema } from "../validations/db";

export type Address = z.infer<typeof addressInsertSchema>;

interface useAddressInputProps {
  address: Address | undefined;
  setAddress: (address: Address | undefined) => void;
}

const useAddressInput = create<useAddressInputProps>((set, get) => ({
  address: undefined,
  setAddress: (address: Address | undefined) => {
    set((state) => ({
      ...state,
      address,
    }));
  },
}));

export default useAddressInput;
