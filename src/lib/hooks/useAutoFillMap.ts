import { create } from "zustand";
import { type Address } from "./useAddressInput";

interface useAutoFillMapProps {
	address: Address | undefined;
	setAddress: (address: Address | undefined) => void;
}

export const useAutoFillMap = create<useAutoFillMapProps>((set, get) => ({
	address: undefined,
	setAddress: (address: Address | undefined) => {
		set((state) => ({
			...state,
			address,
		}));
	},
}));
