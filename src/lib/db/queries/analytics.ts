import QueryClient from ".";
import {
	jobRecommendationHistory,
	jobViewHistory,
} from "@/lib/db/drizzle/schema";
import { registerService } from "@/lib/utils";
import { db } from "..";

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

	async TrackJobView(accountId: string, jobId: string) {
		return await this.caller.insert(jobViewHistory).values({
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
