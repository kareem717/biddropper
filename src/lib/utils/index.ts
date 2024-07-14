import { customAlphabet } from "nanoid";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "process";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789");

/**
 * Time since.
 * @description Returns a string representing the time since the
 * given date down to the minute. Automatically pluralizes the time unit.
 * @arg {Date} then Date to compare.
 * @return {string} Time since the given date.
 */
export function timeSince(then: Date) {
	const HOUR_IN_MINUTES = 60;
	const DAY_IN_MINUTES = 24 * HOUR_IN_MINUTES;
	const MONTH_IN_MINUTES = 30 * DAY_IN_MINUTES;
	const YEAR_IN_MINUTES = 12 * MONTH_IN_MINUTES;

	const now = new Date();
	const diff = now.getTime() - then.getTime();
	const diffInMinutes = Math.floor(diff / (1000 * 60));

	const pluralize = (value: number, unit: string) => {
		return `${value} ${unit}${value === 1 ? "" : "s"}`;
	};

	const units = [
		{ label: "year", value: YEAR_IN_MINUTES },
		{ label: "month", value: MONTH_IN_MINUTES },
		{ label: "day", value: DAY_IN_MINUTES },
		{ label: "hour", value: HOUR_IN_MINUTES },
		{ label: "minute", value: 1 },
	];

	for (const unit of units) {
		if (diffInMinutes >= unit.value) {
			const count = Math.floor(diffInMinutes / unit.value);
			return `${pluralize(count, unit.label)} ago`;
		}
	}

	return "less than a minute ago";
}

/**
 * Truncate.
 * @description Truncates a string to the given length and adds an
 * ellipsis if the string is longer than the given length.
 * @arg {string} str String to truncate.
 * @arg {number} length Length to truncate to.
 * @return {string} Truncated string.
 */
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
