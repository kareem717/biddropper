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
import {
	and,
	count,
	eq,
	gte,
	inArray,
	isNull,
	or,
	lte,
	lt,
	min,
	sql,
	sum,
} from "drizzle-orm";
import { union } from "drizzle-orm/pg-core";

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
		//TODO: This is atrocious, but it's a quick fix for now
		// TODO: this might cause errors because we're only deleting one row (what happens is a user views at the same time they delete a row?)
		const [jobCount] = await this.caller
			.select({
				count: count(accountJobViewHistories.id),
			})
			.from(accountJobViewHistories)
			.where(
				and(
					eq(accountJobViewHistories.accountId, accountId),
					isNull(accountJobViewHistories.deletedAt)
				)
			);

		const [companyCount] = await this.caller
			.select({
				count: count(accountCompanyViewHistories.id),
			})
			.from(accountCompanyViewHistories)
			.where(
				and(
					eq(accountCompanyViewHistories.accountId, accountId),
					isNull(accountCompanyViewHistories.deletedAt)
				)
			);

		return await this.caller.transaction(async (tx) => {
			if (jobCount.count + companyCount.count >= 5000) {
				const [oldestJobHistory] = await tx
					.select({
						id: accountJobViewHistories.id,
						createdAt: min(accountJobViewHistories.createdAt),
					})
					.from(accountJobViewHistories)
					.where(eq(accountJobViewHistories.accountId, accountId))
					.limit(1)
					.for("update");

				const [oldestCompanyHistory] = await tx
					.select({
						id: accountCompanyViewHistories.id,
						createdAt: min(accountCompanyViewHistories.createdAt),
					})
					.from(accountCompanyViewHistories)
					.where(eq(accountCompanyViewHistories.accountId, accountId))
					.limit(1)
					.for("update");

				let oldestHistory;
				if (
					oldestJobHistory.createdAt &&
					oldestCompanyHistory.createdAt &&
					new Date(oldestJobHistory.createdAt) <
						new Date(oldestCompanyHistory.createdAt)
				) {
					oldestHistory = {
						id: oldestJobHistory.id,
						createdAt: oldestJobHistory.createdAt,
						table: accountJobViewHistories,
					};
				} else {
					oldestHistory = {
						id: oldestCompanyHistory.id,
						createdAt: oldestCompanyHistory.createdAt,
						table: accountCompanyViewHistories,
					};
				}

				await tx
					.update(oldestHistory.table)
					.set({ deletedAt: new Date().toISOString() })
					.where(eq(oldestHistory.table.id, oldestHistory.id));
			}

			return await tx.insert(accountJobViewHistories).values({
				jobId,
				accountId,
			});
		});
	}

	async TrackAccountCompanyView(accountId: string, companyId: string) {
		//TODO: This is atrocious, but it's a quick fix for now
		// TODO: this might cause errors because we're only deleting one row (what happens is a user views at the same time they delete a row?)
		const [jobCount] = await this.caller
			.select({
				count: count(accountJobViewHistories.id),
			})
			.from(accountJobViewHistories)
			.where(
				and(
					eq(accountJobViewHistories.accountId, accountId),
					isNull(accountJobViewHistories.deletedAt)
				)
			);

		const [companyCount] = await this.caller
			.select({
				count: count(accountCompanyViewHistories.id),
			})
			.from(accountCompanyViewHistories)
			.where(
				and(
					eq(accountCompanyViewHistories.accountId, accountId),
					isNull(accountCompanyViewHistories.deletedAt)
				)
			);

		return await this.caller.transaction(async (tx) => {
			if (jobCount.count + companyCount.count >= 5000) {
				const [oldestJobHistory] = await tx
					.select({
						id: accountJobViewHistories.id,
						createdAt: min(accountJobViewHistories.createdAt),
					})
					.from(accountJobViewHistories)
					.where(eq(accountJobViewHistories.accountId, accountId))
					.limit(1)
					.for("update");

				const [oldestCompanyHistory] = await tx
					.select({
						id: accountCompanyViewHistories.id,
						createdAt: min(accountCompanyViewHistories.createdAt),
					})
					.from(accountCompanyViewHistories)
					.where(eq(accountCompanyViewHistories.accountId, accountId))
					.limit(1)
					.for("update");

				let oldestHistory;
				if (
					oldestJobHistory.createdAt &&
					oldestCompanyHistory.createdAt &&
					new Date(oldestJobHistory.createdAt) <
						new Date(oldestCompanyHistory.createdAt)
				) {
					oldestHistory = {
						id: oldestJobHistory.id,
						createdAt: oldestJobHistory.createdAt,
						table: accountJobViewHistories,
					};
				} else {
					oldestHistory = {
						id: oldestCompanyHistory.id,
						createdAt: oldestCompanyHistory.createdAt,
						table: accountCompanyViewHistories,
					};
				}

				await tx
					.update(oldestHistory.table)
					.set({ deletedAt: new Date().toISOString() })
					.where(or(eq(oldestHistory.table.id, oldestHistory.id)));
			}

			return await tx.insert(accountCompanyViewHistories).values({
				companyId,
				accountId,
			});
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

	async GetInteractionSummaryByJobId(jobId: string) {
		const [currentMonth] = await this.caller
			.select({
				views: sum(dailyJobAggregateAnalytics.viewCount),
				bids: sum(dailyJobAggregateAnalytics.bidsRecievedCount),
				favorites: sum(dailyJobAggregateAnalytics.favouritedCount),
			})
			.from(dailyJobAggregateAnalytics)
			.where(
				and(
					eq(dailyJobAggregateAnalytics.jobId, jobId),
					gte(
						dailyJobAggregateAnalytics.createdAt,
						sql<string>`NOW() - INTERVAL '1 month'`
					)
				)
			);

		const [previousMonth] = await this.caller
			.select({
				views: sum(dailyJobAggregateAnalytics.viewCount),
				bids: sum(dailyJobAggregateAnalytics.bidsRecievedCount),
				favorites: sum(dailyJobAggregateAnalytics.favouritedCount),
			})
			.from(dailyJobAggregateAnalytics)
			.where(
				and(
					eq(dailyJobAggregateAnalytics.jobId, jobId),
					gte(
						dailyJobAggregateAnalytics.createdAt,
						sql<string>`NOW() - INTERVAL '2 month'`
					),
					lt(
						dailyJobAggregateAnalytics.createdAt,
						sql<string>`NOW() - INTERVAL '1 month'`
					)
				)
			);

		return {
			currentMonth,
			previousMonth,
		};
	}

	async GetPublicInteractionSummaryByCompanyId(companyId: string) {
		const [data] = await this.caller
			.select({
				views: sum(dailyCompanyAggregateAnalytics.viewCount),
				favorites: sum(dailyCompanyAggregateAnalytics.favouritedCount),
			})
			.from(dailyCompanyAggregateAnalytics)
			.where(
				and(
					eq(dailyCompanyAggregateAnalytics.companyId, companyId),
					gte(
						dailyCompanyAggregateAnalytics.createdAt,
						sql<string>`NOW() - INTERVAL '3 month'`
					)
				)
			);

		return data;
	}

	async GetPublicInteractionSummaryByJobId(jobId: string) {
		const [data] = await this.caller
			.select({
				views: sum(dailyJobAggregateAnalytics.viewCount),
				bids: sum(dailyJobAggregateAnalytics.bidsRecievedCount),
				favorites: sum(dailyJobAggregateAnalytics.favouritedCount),
			})
			.from(dailyJobAggregateAnalytics)
			.where(
				and(
					eq(dailyJobAggregateAnalytics.jobId, jobId),
					gte(
						dailyJobAggregateAnalytics.createdAt,
						sql<string>`NOW() - INTERVAL '3 month'`
					)
				)
			);

		return data;
	}
}

// Create  global service
export default registerService(
	"analyticQueryClient",
	() => new AnalyticQueryClient(db)
);
