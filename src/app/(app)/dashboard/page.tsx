"use client";

import { ChartShell } from "@/components/dashboard/ChartShell";
import { MetricSummary } from "@/components/dashboard/MetricSummary";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

export default function DashboardPage() {
	return (
		<main className="p-8 flex flex-col gap-8 justify-start items-center h-full w-full mb-12">
			<div className="flex justify-between items-center w-full">
				<h1 className="font-semibold text-2xl">Dashboard</h1>
				<Select>
					<SelectTrigger className="w-full min-w-32 max-w-60">
						<SelectValue placeholder="Theme" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="light">Light</SelectItem>
						<SelectItem value="dark">Dark</SelectItem>
						<SelectItem value="system">System</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-8">
				{[...Array(4)].map((_, i) => (
					<ChartShell key={i}>
						<MetricSummary label="Total Bids" icon="gavel" value="100K" percentageChange={i % 2 === 0 ? 10 : -10} description="This is a description" />
					</ChartShell>
				))}
			</div>
			<div className="w-full">
				<ChartShell title="Total Bids">
					<div className="w-full h-96">
						hello
					</div>
				</ChartShell>
			</div>
			<div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-3 gap-4 w-full">
				<ChartShell title="Total Bids">
					<div className="w-full">
						hello
					</div>
				</ChartShell>
				<ChartShell className="md:col-span-2" title="Total Bids">
					<div className="w-full">
						hello
					</div>
				</ChartShell>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
				<ChartShell title="Total Bids">
					<div className="w-full">
						hello
					</div>
				</ChartShell>
				<div className="grid grid-rows-2 gap-4 w-full">
					<ChartShell title="Total Bids">
						<div className="w-full">
							hello
						</div>
					</ChartShell>
					<ChartShell title="Total Bids">
						<div className="w-full">
							hello
						</div>
					</ChartShell>
				</div>
			</div>
			<div className="w-full">
				<ChartShell title="Total Bids">
					<div className="w-full h-96">
						hello
					</div>
				</ChartShell>
			</div>
		</main>
	);
}
