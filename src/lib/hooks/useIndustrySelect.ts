import { create } from "zustand";
import { InferSelectModel } from "drizzle-orm";
import { industries } from "../db/drizzle/schema";

export type Industry = InferSelectModel<typeof industries>;

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
