import { create } from "zustand";
import { industries } from "../db/drizzle/schema";
import { Industry as DbIndustry } from "../db/types";

export type Industry = DbIndustry;

interface useIndustrySelectProps {
	selectedIndustries: Industry[];
	getSelectedIndustries: () => Industry[];
	setSelectedIndustries: (industries: Industry[] | undefined) => void;
}

export const useIndustrySelect = create<useIndustrySelectProps>((set, get) => ({
	selectedIndustries: [],
	getSelectedIndustries: () => {
		return get().selectedIndustries;
	},
	setSelectedIndustries: (selectedIndustries: Industry[] | undefined) => {
		set((state) => ({
			...state,
			selectedIndustries,
		}));
	},
}));
