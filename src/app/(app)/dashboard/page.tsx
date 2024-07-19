"use client";

import { MetricSummary } from "@/components/analytics/MetricSummary";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { HottestBidsCard } from "@/components/analytics/HottestBidsCard";
import { BidAcceptanceComparison } from "@/components/analytics/charts/BidAcceptanceComparisonBarChart";
import { CompanyJobViewComparison } from "@/components/analytics/charts/CompanyJobViewComparison";
import { JobViewConversionRate } from "@/components/analytics/charts/JobViewConversionRate";
import { RepeatBidAcceptance } from "@/components/analytics/charts/RepeatBidAcceptance";
import { JobCompanyViewFunnel } from "@/components/analytics/charts/JobCompanyViewFunnel";

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
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-4 sm:mt-8">
				{[...Array(4)].map((_, i) => (
					<MetricSummary key={i} label="Total Bids" icon="gavel" value="100K" percentageChange={i % 2 === 0 ? 10 : -10} description="This is a description" />
				))}
			</div>
			<div className="w-full">
				<BidAcceptanceComparison />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
				<HottestBidsCard />
				<div className="grid grid-rows-2 grid-cols-1 gap-4 w-full">
					<JobViewConversionRate />
					<CompanyJobViewComparison />
				</div>
			</div>
			<div className="grid grid-cols-1 grid-rows-2 md:grid-rows-1 md:grid-cols-3 gap-4 w-full">
				<RepeatBidAcceptance />
				<JobCompanyViewFunnel />
			</div>
		</main>
	);
}
