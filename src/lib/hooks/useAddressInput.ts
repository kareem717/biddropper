import { create } from "zustand";
import { NewAddress } from "../validations/db";

interface useAddressInputProps {
  address: NewAddress | undefined;
  setAddress: (address: NewAddress | undefined) => void;
  getAddress: () => NewAddress | undefined;
}

const useAddressInput = create<useAddressInputProps>((set, get) => ({
  address: undefined,
  setAddress: (address: NewAddress | undefined) => {
    set((state) => ({
      ...state,
      address,
    }));
  },
  getAddress: () => {
    return get().address;
  },
}));

export default useAddressInput;
