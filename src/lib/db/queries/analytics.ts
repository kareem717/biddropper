import QueryClient from ".";
import {
	accountJobReccomendationHistories,
	accountCompanyReccomendationHistories,
	companyAnalytics,
	jobAnalytics,
	accountViewHistories,
} from "@/lib/db/drizzle/schema";
import { registerService } from "@/lib/utils";
import { db } from "..";
import { eq, sql } from "drizzle-orm";

export type JobRecommendation = {
	jobId: string;
	accountId: string;
};

export type CompanyRecommendation = {
	companyId: string;
	accountId: string;
};

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

	async IncrementCompanyViews(companyId: string) {
		return await this.caller
			.update(companyAnalytics)
			.set({
				weeklyViews: sql`${companyAnalytics.weeklyViews} + 1`,
				monthlyViews: sql`${companyAnalytics.monthlyViews} + 1`,
			})
			.where(eq(companyAnalytics.companyId, companyId));
	}

	async IncrementJobViews(jobId: string) {
		return await this.caller
			.update(jobAnalytics)
			.set({
				monthlyViews: sql`${jobAnalytics.monthlyViews} + 1`,
				weeklyViews: sql`${jobAnalytics.weeklyViews} + 1`,
			})
			.where(eq(jobAnalytics.jobId, jobId));
	}

	async DecrementCompanyViews(companyId: string) {
		return await this.caller
			.update(companyAnalytics)
			.set({
				weeklyViews: sql`${companyAnalytics.weeklyViews} - 1`,
				monthlyViews: sql`${companyAnalytics.monthlyViews} - 1`,
			})
			.where(eq(companyAnalytics.companyId, companyId));
	}

	async DecrementJobViews(jobId: string) {
		return await this.caller
			.update(jobAnalytics)
			.set({
				monthlyViews: sql`${jobAnalytics.monthlyViews} - 1`,
				weeklyViews: sql`${jobAnalytics.weeklyViews} - 1`,
			})
			.where(eq(jobAnalytics.jobId, jobId));
	}

	async IncrementCompanyBids(companyId: string) {
		return await this.caller
			.update(companyAnalytics)
			.set({
				weeklyBidsReceived: sql`${companyAnalytics.weeklyBidsReceived} + 1`,
				monthlyBidsReceived: sql`${companyAnalytics.monthlyBidsReceived} + 1`,
			})
			.where(eq(companyAnalytics.companyId, companyId));
	}

	async IncrementJobBids(jobId: string) {
		return await this.caller
			.update(jobAnalytics)
			.set({
				monthlyBidsReceived: sql`${jobAnalytics.monthlyBidsReceived} + 1`,
				weeklyBidsReceived: sql`${jobAnalytics.weeklyBidsReceived} + 1`,
			})
			.where(eq(jobAnalytics.jobId, jobId));
	}

	async DecrementCompanyBids(companyId: string) {
		return await this.caller
			.update(companyAnalytics)
			.set({
				weeklyBidsReceived: sql`${companyAnalytics.weeklyBidsReceived} - 1`,
				monthlyBidsReceived: sql`${companyAnalytics.monthlyBidsReceived} - 1`,
			})
			.where(eq(companyAnalytics.companyId, companyId));
	}

	async DecrementJobBids(jobId: string) {
		return await this.caller
			.update(jobAnalytics)
			.set({
				monthlyBidsReceived: sql`${jobAnalytics.monthlyBidsReceived} - 1`,
				weeklyBidsReceived: sql`${jobAnalytics.weeklyBidsReceived} - 1`,
			})
			.where(eq(jobAnalytics.jobId, jobId));
	}

	async IncrementCompanyFavorites(companyId: string) {
		return await this.caller
			.update(companyAnalytics)
			.set({
				weeklyFavourites: sql`${companyAnalytics.weeklyFavourites} + 1`,
				monthlyFavourites: sql`${companyAnalytics.monthlyFavourites} + 1`,
			})
			.where(eq(companyAnalytics.companyId, companyId));
	}

	async IncrementJobFavorites(jobId: string) {
		return await this.caller
			.update(jobAnalytics)
			.set({
				monthlyFavourites: sql`${jobAnalytics.monthlyFavourites} + 1`,
				weeklyFavourites: sql`${jobAnalytics.weeklyFavourites} + 1`,
			})
			.where(eq(jobAnalytics.jobId, jobId));
	}

	async DecrementCompanyFavorites(companyId: string) {
		return await this.caller
			.update(companyAnalytics)
			.set({
				weeklyFavourites: sql`${companyAnalytics.weeklyFavourites} - 1`,
				monthlyFavourites: sql`${companyAnalytics.monthlyFavourites} - 1`,
			})
			.where(eq(companyAnalytics.companyId, companyId));
	}

	async DecrementJobFavorites(jobId: string) {
		return await this.caller
			.update(jobAnalytics)
			.set({
				monthlyFavourites: sql`${jobAnalytics.monthlyFavourites} - 1`,
				weeklyFavourites: sql`${jobAnalytics.weeklyFavourites} - 1`,
			})
			.where(eq(jobAnalytics.jobId, jobId));
	}

	async CreateJobAnalytics(jobId: string) {
		return await this.caller.insert(jobAnalytics).values({
			jobId: jobId,
		});
	}

	async CreateCompanyAnalytics(companyId: string) {
		return await this.caller.insert(companyAnalytics).values({
			companyId: companyId,
		});
	}

	async TrackAccountJobView(accountId: string, jobId: string) {
		return await this.caller.insert(accountViewHistories).values({
			jobId,
			accountId,
		});
	}

	async TrackAccountCompanyView(accountId: string, companyId: string) {
		return await this.caller.insert(accountViewHistories).values({
			companyId,
			accountId,
		});
	}
}

// Create  global service
export default registerService(
	"analyticQueryClient",
	() => new AnalyticQueryClient(db)
);
