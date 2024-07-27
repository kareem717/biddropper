import QueryClient from ".";
import {
	accountJobReccomendationHistories,
	accountCompanyReccomendationHistories,
	accountJobViewHistories,
	accountCompanyViewHistories,
	dailyJobAggregateAnalytics,
	dailyCompanyAggregateAnalytics,
	bids,
	bidStatus,
} from "@/lib/db/drizzle/schema";
import { registerService } from "@/lib/utils";
import { db } from "..";
import { JobRecommendation, CompanyRecommendation } from "./validation";
import JobQueryClient from "./job";
import { and, count, eq, gte, inArray, lt, sql, sum } from "drizzle-orm";

class AnalyticQueryClient extends QueryClient {
	async TrackAccountJobRecommendation(values: JobRecommendation[]) {
		return await this.caller
			.insert(accountJobReccomendationHistories)
			.values(values)
			.returning();
	}

	async TrackAccountCompanyRecommendation(values: CompanyRecommendation[]) {
		return await this.caller
			.insert(accountCompanyReccomendationHistories)
			.values(values)
			.returning();
	}

	async TrackAccountJobView(accountId: string, jobId: string) {
		return await this.caller.insert(accountJobViewHistories).values({
			jobId,
			accountId,
		});
	}

	async TrackAccountCompanyView(accountId: string, companyId: string) {
		return await this.caller.insert(accountCompanyViewHistories).values({
			companyId,
			accountId,
		});
	}

	async GetJobViewVersusJobBidWeeklyByCompanyId(companyId: string) {
		const companyJobs = await JobQueryClient.GetBasicManyByCompanyId(companyId);

		const res = await this.caller
			.select({
				week: sql<string>`DATE_TRUNC('week', ${dailyJobAggregateAnalytics.createdAt})`,
				bids: sum(dailyJobAggregateAnalytics.bidsRecievedCount),
				views: sum(dailyJobAggregateAnalytics.viewCount),
			})
			.from(dailyJobAggregateAnalytics)
			.where(
				inArray(
					dailyJobAggregateAnalytics.jobId,
					companyJobs.map((job) => job.id)
				)
			)
			.groupBy(
				sql<string>`DATE_TRUNC('week', ${dailyJobAggregateAnalytics.createdAt})`
			);

		return res;
	}

	async GetCompanyViewsVersusJobViewsWeeklyByCompanyId(companyId: string) {
		const companyJobs = await JobQueryClient.GetBasicManyByCompanyId(companyId);

		const jobStats = await this.caller
			.select({
				week: sql<string>`DATE_TRUNC('week', ${dailyJobAggregateAnalytics.createdAt})`,
				views: sum(dailyJobAggregateAnalytics.viewCount),
			})
			.from(dailyJobAggregateAnalytics)
			.where(
				inArray(
					dailyJobAggregateAnalytics.jobId,
					companyJobs.map((job) => job.id)
				)
			)
			.groupBy(
				sql<string>`DATE_TRUNC('week', ${dailyJobAggregateAnalytics.createdAt})`
			);

		const companyStats = await this.caller
			.select({
				week: sql<string>`DATE_TRUNC('week', ${dailyCompanyAggregateAnalytics.createdAt})`,
				views: sum(dailyCompanyAggregateAnalytics.viewCount),
			})
			.from(dailyCompanyAggregateAnalytics)
			.where(eq(dailyCompanyAggregateAnalytics.companyId, companyId))
			.groupBy(
				sql<string>`DATE_TRUNC('week', ${dailyCompanyAggregateAnalytics.createdAt})`
			);

		return {
			company: companyStats,
			job: jobStats,
		};
	}

	async GetBidsSentVersusAcceptedWeeklyByCompanyId(companyId: string) {
		const sent = await this.caller
			.select({
				week: sql<string>`DATE_TRUNC('week', ${bids.createdAt})`,
				sent: count(bids.id),
			})
			.from(bids)
			.where(
				and(
					eq(bids.senderCompanyId, companyId),
					eq(bids.status, bidStatus.enumValues[0])
				)
			)
			.groupBy(sql<string>`DATE_TRUNC('week', ${bids.createdAt})`);

		const accepted = await this.caller
			.select({
				week: sql<string>`DATE_TRUNC('week', ${bids.createdAt})`,
				accepted: count(bids.id),
			})
			.from(bids)
			.where(
				and(
					eq(bids.senderCompanyId, companyId),
					eq(bids.status, bidStatus.enumValues[1])
				)
			)
			.groupBy(sql<string>`DATE_TRUNC('week', ${bids.createdAt})`);

		return {
			sent,
			accepted,
		};
	}

	async GetInteractionSummaryByCompanyId(companyId: string) {
		const [currentMonth] = await this.caller
			.select({
				views: sum(dailyCompanyAggregateAnalytics.viewCount),
				bids: sum(dailyCompanyAggregateAnalytics.bidsRecievedCount),
				favorites: sum(dailyCompanyAggregateAnalytics.favouritedCount),
			})
			.from(dailyCompanyAggregateAnalytics)
			.where(
				and(
					eq(dailyCompanyAggregateAnalytics.companyId, companyId),
					gte(
						dailyCompanyAggregateAnalytics.createdAt,
						sql<string>`NOW() - INTERVAL '1 month'`
					)
				)
			);

		const [previousMonth] = await this.caller
			.select({
				views: sum(dailyCompanyAggregateAnalytics.viewCount),
				bids: sum(dailyCompanyAggregateAnalytics.bidsRecievedCount),
				favorites: sum(dailyCompanyAggregateAnalytics.favouritedCount),
			})
			.from(dailyCompanyAggregateAnalytics)
			.where(
				and(
					eq(dailyCompanyAggregateAnalytics.companyId, companyId),
					gte(
						dailyCompanyAggregateAnalytics.createdAt,
						sql<string>`NOW() - INTERVAL '2 month'`
					),
					lt(
						dailyCompanyAggregateAnalytics.createdAt,
						sql<string>`NOW() - INTERVAL '1 month'`
					)
				)
			);

		return {
			currentMonth,
			previousMonth,
		};
	}
}

// Create  global service
export default registerService(
	"analyticQueryClient",
	() => new AnalyticQueryClient(db)
);
