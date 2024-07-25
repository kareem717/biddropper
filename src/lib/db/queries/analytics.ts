import QueryClient from ".";
import {
	jobRecommendationHistory,
	accountViewHistories,
	companyAnalytics,
} from "@/lib/db/drizzle/schema";
import { registerService } from "@/lib/utils";
import { db } from "..";
import { eq, sql } from "drizzle-orm";

export type JobRecommendation = {
	jobId: string;
	accountId: string;
};

class AnalyticQueryClient extends QueryClient {
	async TrackJobReccomendation(values: JobRecommendation[]) {
		return await this.caller
			.insert(jobRecommendationHistory)
			.values(values)
			.returning();
	}

	async IncrementCompanyProfileViews(companyId: string) {
		return await this.caller
			.update(companyAnalytics)
			.set({
				monthlyProfileViews: sql`${companyAnalytics.monthlyProfileViews} + 1`,
			})
			.where(eq(companyAnalytics.companyId, companyId));
	}

	async TrackAccountJobView(accountId: string, jobId: string) {
		return await this.caller.insert(accountViewHistories).values({
			jobId: jobId,
			accountId: accountId,
		});
	}

	async TrackAccountCompanyView(accountId: string, jobId: string) {
		return await this.caller.insert(accountViewHistories).values({
			jobId: jobId,
			accountId: accountId,
		});
	}
}

// Create  global service
export default registerService(
	"analyticQueryClient",
	() => new AnalyticQueryClient(db)
);
