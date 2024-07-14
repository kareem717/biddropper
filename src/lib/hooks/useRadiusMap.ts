import { create } from "zustand";
import { type NewAddress } from "@/lib/validations/address";

interface useRadiusMapProps {
  address: NewAddress | undefined;
  radius: number | undefined;
  setAddress: (address: NewAddress | undefined) => void;
  setRadius: (radius: number) => void;
  getAddress: () => NewAddress | undefined;
  getRadius: () => number | undefined;
}

const useRadiusMap = create<useRadiusMapProps>((set, get) => ({
  address: undefined,
  radius: undefined,
  setAddress: (address: NewAddress | undefined) => {
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
  getAddress: () => {
    return get().address;
  },
  getRadius: () => {
    return get().radius;
  },
}));

export default useRadiusMap;
