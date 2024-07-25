import { create } from "zustand";
import { type NewAddress } from "@/lib/db/queries/validation";

interface useAutoFillMapProps {
	address: NewAddress | undefined;
	setAddress: (address: NewAddress | undefined) => void;
	getAddress: () => NewAddress | undefined;
}

export const useAutoFillMap = create<useAutoFillMapProps>((set, get) => ({
	address: undefined,
	setAddress: (address: NewAddress | undefined) => {
		set((state) => ({
			...state,
			address,
		}));
	},
	getAddress: () => get().address,
}));
