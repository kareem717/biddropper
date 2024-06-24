import { customAlphabet } from "nanoid";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789");

export function toTitleCase(str: string) {
	return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function timeSince(then: Date) {
	const now = new Date();
	const diff = now.getTime() - then.getTime();
	const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));

	const pluralize = (value: number, unit: string) => {
		return `${value} ${unit}${value === 1 ? "" : "s"}`;
	};

	if (diffInDays === 0) {
		return "less than a day ago";
	} else if (diffInDays < 7) {
		return `${pluralize(diffInDays, "day")} ago`;
	} else if (diffInDays < 30) {
		return `${pluralize(Math.floor(diffInDays / 7), "week")} ago`;
	} else if (diffInDays < 365) {
		return `${pluralize(Math.floor(diffInDays / 30), "month")} ago`;
	} else {
		return `${pluralize(Math.floor(diffInDays / 365), "year")} ago`;
	}
}
