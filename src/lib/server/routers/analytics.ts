import { accountProcedure, companyOwnerProcedure, router } from "../trpc";
import AnalyticsQueryClient from "@/lib/db/queries/analytics";
import CompanyQueryClient from "@/lib/db/queries/company";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { format, getISOWeek } from "date-fns";
import JobQueryClient from "@/lib/db/queries/job";

export const analyticsRouter = router({
	GetCompanyJobViewComparison: companyOwnerProcedure
		.input(
			z.object({
				companyId: z.string().uuid(),
			})
		)
		.query(async ({ input, ctx }) => {
			const ownedCompanies = ctx.ownedCompanies;

			if (!ownedCompanies.some((company) => company.id === input.companyId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You're not authorized to view this company's analytics",
				});
			}

			let rawData;
			try {
				rawData =
					await AnalyticsQueryClient.GetCompanyViewsVersusJobViewsWeeklyByCompanyId(
						input.companyId
					);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error while fetching the analytics data",
					cause: error,
				});
			}

			return rawData.company.map((data, index) => ({
				week: format(new Date(data.week), "P"),
				weekNumber: `W${getISOWeek(new Date(data.week))}`,
				jobViews: rawData.job[index]?.views || 0,
				companyViews: data.views || 0,
			}));
		}),
	GetJobViewBidComparison: companyOwnerProcedure
		.input(
			z.object({
				companyId: z.string().uuid(),
			})
		)
		.query(async ({ input, ctx }) => {
			const ownedCompanies = ctx.ownedCompanies;

			if (!ownedCompanies.some((company) => company.id === input.companyId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You're not authorized to view this company's analytics",
				});
			}

			let rawData;
			try {
				rawData =
					await AnalyticsQueryClient.GetJobViewVersusJobBidWeeklyByCompanyId(
						input.companyId
					);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error while fetching the analytics data",
					cause: error,
				});
			}

			return rawData.map((data) => ({
				week: format(new Date(data.week), "P"),
				weekNumber: `W${getISOWeek(new Date(data.week))}`,
				views: data.views,
				bids: data.bids,
			}));
		}),
	GetBidsSentVersusAccepted: companyOwnerProcedure
		.input(
			z.object({
				companyId: z.string().uuid(),
			})
		)
		.query(async ({ input, ctx }) => {
			const ownedCompanies = ctx.ownedCompanies;

			if (!ownedCompanies.some((company) => company.id === input.companyId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You're not authorized to view this company's analytics",
				});
			}

			let rawData;
			try {
				rawData =
					await AnalyticsQueryClient.GetBidsSentVersusAcceptedWeeklyByCompanyId(
						input.companyId
					);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error while fetching the analytics data",
					cause: error,
				});
			}

			const combinedData = rawData.sent.map((sentData) => {
				const acceptedData = rawData.accepted.find(
					(accepted) => accepted.week === sentData.week
				);

				return {
					week: format(new Date(sentData.week), "P"),
					weekNumber: `W${getISOWeek(new Date(sentData.week))}`,
					sent: sentData.sent,
					accepted: acceptedData ? acceptedData.accepted : 0,
				};
			});

			return combinedData;
		}),

	GetMonthlyAnalyticsByCompanyId: companyOwnerProcedure
		.input(z.object({ companyId: z.string().uuid() }))
		.query(async ({ input, ctx }) => {
			const ownedCompanies = ctx.ownedCompanies;

			if (!ownedCompanies.some((company) => company.id === input.companyId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You're not authorized to view this company's analytics",
				});
			}

			let rawData;
			try {
				rawData = await AnalyticsQueryClient.GetInteractionSummaryByCompanyId(
					input.companyId
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while fetching the analytics data",
					cause: error,
				});
			}

			const calcData = (curr: string | null, prev: string | null) => {
				const numCurr = Number(curr);
				const numPrev = Number(prev);

				let percentageChange = 100;
				if (numPrev !== 0) {
					percentageChange = (numCurr / numPrev - 1) * 100;
				}

				return {
					current: numCurr,
					previous: numPrev,
					change: numCurr - numPrev,
					percentageChange: Math.round(percentageChange),
				};
			};

			try {
				const calculatedData = {
					views: calcData(
						rawData.currentMonth.views,
						rawData.previousMonth.views
					),
					bids: calcData(rawData.currentMonth.bids, rawData.previousMonth.bids),
					favorites: calcData(
						rawData.currentMonth.favorites,
						rawData.previousMonth.favorites
					),
				};

				return calculatedData;
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while processing the analytics data",
					cause: error,
				});
			}
		}),

	GetPublicMonthlyAnalyticsByCompanyId: companyOwnerProcedure
		.input(z.object({ companyId: z.string().uuid() }))
		.query(async ({ input }) => {
			try {
				return await AnalyticsQueryClient.GetPublicInteractionSummaryByCompanyId(
					input.companyId
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error while fetching the analytics data",
					cause: error,
				});
			}
		}),

	GetPublicMonthlyAnalyticsByJobId: accountProcedure
		.input(z.object({ jobId: z.string().uuid() }))
		.query(async ({ input }) => {
			try {
				return await AnalyticsQueryClient.GetPublicInteractionSummaryByJobId(
					input.jobId
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error while fetching the analytics data",
					cause: error,
				});
			}
		}),

	GetMonthlyAnalyticsByJobId: accountProcedure
		.input(z.object({ jobId: z.string().uuid() }))
		.query(async ({ input, ctx }) => {
			let ownedJobs;
			try {
				ownedJobs = await JobQueryClient.GetDetailedManyOwnedByAccountId(
					ctx.account.id
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error while fetching your owned jobs",
					cause: error,
				});
			}

			if (!ownedJobs.some((job) => job.id === input.jobId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You're not authorized to view this job's analytics",
				});
			}

			let rawData;
			try {
				rawData = await AnalyticsQueryClient.GetInteractionSummaryByJobId(
					input.jobId
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error while fetching the analytics data",
					cause: error,
				});
			}

			const calcData = (curr: string | null, prev: string | null) => {
				const numCurr = Number(curr);
				const numPrev = Number(prev);

				let percentageChange = 100;
				if (numPrev !== 0) {
					percentageChange = (numCurr / numPrev - 1) * 100;
				}

				return {
					current: numCurr,
					previous: numPrev,
					change: numCurr - numPrev,
					percentageChange: Math.round(percentageChange),
				};
			};

			try {
				const calculatedData = {
					views: calcData(
						rawData.currentMonth.views,
						rawData.previousMonth.views
					),
					bids: calcData(rawData.currentMonth.bids, rawData.previousMonth.bids),
					favorites: calcData(
						rawData.currentMonth.favorites,
						rawData.previousMonth.favorites
					),
				};

				return calculatedData;
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An error occurred while processing the analytics data",
					cause: error,
				});
			}
		}),
});
