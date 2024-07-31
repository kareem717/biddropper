"use client";

import { MetricSummary } from "@/components/analytics/metrics/MetricSummary";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { HottestBidsCard } from "@/components/bids/HottestBidsCard";
import { BidAcceptanceChart } from "@/components/analytics/charts/BidAcceptanceChart";
import { ViewComparisonChart } from "@/components/analytics/charts/ViewComparisonChart";
import { ViewConversionRateChart } from "@/components/analytics/charts/ViewConversionRateChart";
import { trpc } from "@/lib/trpc/client";
import { ErrorDiv } from "@/components/app/ErrorDiv";
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"

export default function DashboardPage() {
	const [selectedCompany, setSelectedCompany] = useState<string>("")
	const {
		data: companies,
		isLoading: companiesLoading,
		error: companiesError,
		isError: isCompaniesError,
		refetch: companiesRefetch,
		isRefetching: companiesRefetching,
		errorUpdateCount: companiesErrorUpdateCount
	} = trpc.company.getOwnedCompanies.useQuery({
		includeDeleted: false
	}, {
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		retry: false,
		onSuccess: (data) => {
			if (data && data.length > 0) {
				setSelectedCompany(data[0].id)
			}
		}
	})

	return (
		<>
			{isCompaniesError ? (
				<ErrorDiv message={companiesError?.message} retry={companiesRefetch} isRetrying={companiesRefetching} retriable={companiesErrorUpdateCount < 5} />
			) :
				companiesLoading || companiesRefetching ? (
					<div className="w-full h-full flex flex-col justify-center items-center gap-8 p-8">
						<div className="flex flex-row h-24 w-full justify-between">
							<Skeleton className="w-1/4 h-full" />
							<Skeleton className="w-1/3 h-full" />
						</div>
						<Skeleton className="w-full h-full" />
					</div>
				) :
					(
						<main className="p-4 sm:p-8 flex flex-col gap-8 justify-start items-center h-full w-full">
							<div className="flex justify-between items-center w-full">
								<h1 className="font-semibold text-2xl">Dashboard</h1>
								<Select
									defaultValue={selectedCompany}
									onValueChange={(value) => setSelectedCompany(value)}
								>
									<SelectTrigger className="w-32 sm:w-60">
										<SelectValue placeholder="Company" />
									</SelectTrigger>
									<SelectContent>
										{companies?.map((company) => (
											<SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<MetricSummary />
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
								<BidAcceptanceChart companyId={selectedCompany} />
								<div className="grid grid-rows-2 grid-cols-1 gap-4 w-full">
									<ViewConversionRateChart companyId={selectedCompany} />
									<ViewComparisonChart companyId={selectedCompany} />
								</div>
							</div>
							<div className="w-full">
								<HottestBidsCard entity={{ companyId: selectedCompany }} />
							</div>
						</main>
					)}
		</>
	);
}
