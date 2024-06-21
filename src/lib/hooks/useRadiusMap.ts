import { create } from "zustand";
import { type Address } from "./useAddressInput";

interface useRadiusMapProps {
  address: Address | undefined;
  radius: number | undefined;
  setAddress: (address: Address | undefined) => void;
  setRadius: (radius: number) => void;
}

const useRadiusMap = create<useRadiusMapProps>((set, get) => ({
  address: undefined,
  radius: undefined,
  setAddress: (address: Address | undefined) => {
    set((state) => ({
      ...state,
      address,
    }));
  },
  setRadius: (radius: number) => {
    set((state) => ({
      ...state,
      radius,
    }));
  },
}));

export default useRadiusMap;
