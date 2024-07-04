import { customAlphabet } from "nanoid";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "process";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789");

export function toTitleCase(str: string) {
	return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

const HOUR_IN_MINUTES = 60;
const DAY_IN_MINUTES = 24 * HOUR_IN_MINUTES;
const MONTH_IN_MINUTES = 30 * DAY_IN_MINUTES;
const YEAR_IN_MINUTES = 12 * MONTH_IN_MINUTES;

export function timeSince(then: Date) {
	const now = new Date();
	const diff = now.getTime() - then.getTime();
	const diffInMinutes = Math.floor(diff / (1000 * 60));

	const pluralize = (value: number, unit: string) => {
		return `${value} ${unit}${value === 1 ? "" : "s"}`;
	};

	if (diffInMinutes === 0) {
		return "less than a minute ago";
	} else if (diffInMinutes < HOUR_IN_MINUTES) {
		return `${pluralize(diffInMinutes, "minute")} ago`;
	} else if (diffInMinutes < DAY_IN_MINUTES) {
		return `${pluralize(
			Math.floor(diffInMinutes / HOUR_IN_MINUTES),
			"hour"
		)} ago`;
	} else if (diffInMinutes < MONTH_IN_MINUTES) {
		return `${pluralize(
			Math.floor(diffInMinutes / DAY_IN_MINUTES),
			"day"
		)} ago`;
	} else if (diffInMinutes < YEAR_IN_MINUTES) {
		return `${pluralize(
			Math.floor(diffInMinutes / MONTH_IN_MINUTES),
			"month"
		)} ago`;
	} else {
		return `${pluralize(
			Math.floor(diffInMinutes / YEAR_IN_MINUTES),
			"year"
		)} ago`;
	}
}

export function truncate(str: string, length: number) {
	return str.length > length ? str.substring(0, length) + "..." : str;
}

/**
 * Register service.
 * @description Stores instances in `global` to prevent memory leaks in development.
 * @arg {string} name Service name.
 * @arg {function} initFn Function returning the service instance.
 * @return {*} Service instance.
 */
export const registerService = <T>(name: string, initFn: () => T) => {
	if (env.NODE_ENV === "development") {
		if (!(name in global)) {
			// @ts-ignore
			global[name] = initFn();
		}
		// @ts-ignore
		return global[name] as ReturnType<typeof initFn>;
	}
	return initFn();
};
