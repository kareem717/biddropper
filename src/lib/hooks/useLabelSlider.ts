import { create } from "zustand";

interface useLabelSliderProps {
	label: string | undefined;
	value: number;
	isEditing: boolean;
	setLabel: (label: string | undefined) => void;
	setValue: (value: number) => void;
	setIsEditing: (isEditing: boolean) => void;
	getLabel: () => string | undefined;
	getValue: () => number;
	getIsEditing: () => boolean;
}

const useLabelSlider = create<useLabelSliderProps>((set, get) => ({
	label: undefined,
	value: 0,
	isEditing: false,
	setLabel: (label: string | undefined) => {
		set((state) => ({
			...state,
			label,
		}));
	},
	setValue: (value: number) => {
		set((state) => ({
			...state,
			value,
		}));
	},
	setIsEditing: (isEditing: boolean) => {
		set((state) => ({
			...state,
			isEditing,
		}));
	},
	getLabel: () => {
		return get().label;
	},
	getValue: () => {
		return get().value;
	},
	getIsEditing: () => {
		return get().isEditing;
	},
}));

export default useLabelSlider;
