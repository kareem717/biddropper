import QueryClient from ".";
import {
	accountJobReccomendationHistories,
	accountCompanyReccomendationHistories,
	accountJobViewHistories,
	accountCompanyViewHistories,
} from "@/lib/db/drizzle/schema";
import { registerService } from "@/lib/utils";
import { db } from "..";
import { JobRecommendation, CompanyRecommendation } from "./validation";

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

	// async GetMonthlyBidsSentVersusAcceptedByCompanyId(companyId: string) {
	// 	return await this.caller.query.bids.findMany({
	// 		where: eq(bids.companyId, companyId),
	// 	});
	// }

	// async GetJobViewVersusJobBidByCompanyId(companyId: string) {
	// 	return await this.caller.query.bids.findMany({
	// 		where: eq(bids.companyId, companyId),
	// 	});
	// }

	// async GetCompanyViewsVersusJobViewsByCompanyId(companyId: string) {
	// 	return await this.caller.query.bids.findMany({
	// 		where: eq(bids.companyId, companyId),
	// 	});
	// }
}

// Create  global service
export default registerService(
	"analyticQueryClient",
	() => new AnalyticQueryClient(db)
);
