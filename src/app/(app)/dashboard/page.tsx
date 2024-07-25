"use client";

import { MetricSummary } from "@/components/analytics/metrics/MetricSummary";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { HottestBidsCard } from "@/components/analytics/HottestBidsCard";
import { BidAcceptanceChart } from "@/components/analytics/charts/BidAcceptanceChart";
import { ViewComparisonChart } from "@/components/analytics/charts/ViewComparisonChart";
import { ViewConversionRateChart } from "@/components/analytics/charts/ViewConversionRateChart";

export default function DashboardPage() {
	return (
		<main className="p-4 sm:p-8 flex flex-col gap-8 justify-start items-center h-full w-full">
			<div className="flex justify-between items-center w-full">
				<h1 className="font-semibold text-2xl">Dashboard</h1>
				<Select>
					<SelectTrigger className="w-32 sm:w-60">
						<SelectValue placeholder="Theme" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="light">Light</SelectItem>
						<SelectItem value="dark">Dark</SelectItem>
						<SelectItem value="system">System</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<MetricSummary />
			<div className="w-full">
				<HottestBidsCard />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
				<BidAcceptanceChart />
				<div className="grid grid-rows-2 grid-cols-1 gap-4 w-full">
					<ViewConversionRateChart />
					<ViewComparisonChart />
				</div>
			</div>
		</main>
	);
}
