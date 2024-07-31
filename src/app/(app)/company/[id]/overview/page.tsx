import { MetricSummary } from "@/components/analytics/metrics/MetricSummary";
import { HottestBidsCard } from "@/components/bids/HottestBidsCard";
import { BidAcceptanceChart } from "@/components/analytics/charts/BidAcceptanceChart";
import { ViewComparisonChart } from "@/components/analytics/charts/ViewComparisonChart";
import { ViewConversionRateChart } from "@/components/analytics/charts/ViewConversionRateChart";
import { api } from "@/lib/trpc/api";

export default async function OverviewPage({ params }: { params: { id: string } }) {
	const company = await api.company.getCompanyFull.query({ id: params.id })

	return (
		<main className="p-4 sm:p-8 flex flex-col gap-8 justify-start items-center h-full w-full">
			<div className="flex justify-start items-center w-full">
				<h1 className="font-semibold text-2xl">{company.name} Overview</h1>
			</div>
			<MetricSummary />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
				<BidAcceptanceChart companyId={params.id} />
				<div className="grid grid-rows-2 grid-cols-1 gap-4 w-full">
					<ViewConversionRateChart companyId={params.id} />
					<ViewComparisonChart companyId={params.id} />
				</div>
			</div>
			<div className="w-full">
				<HottestBidsCard entity={{ companyId: params.id }} />
			</div>
		</main>
	)
}
