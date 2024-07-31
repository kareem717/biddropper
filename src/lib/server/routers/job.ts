import { router, accountProcedure, companyOwnerProcedure } from "../trpc";
import { z } from "zod";
import { EditJobSchema, NewJobSchema } from "@/lib/db/queries/validation";
import JobQueryClient from "@/lib/db/queries/job";
import AnalyticQueryClient from "@/lib/db/queries/analytics";
import CompanyQueryClient from "@/lib/db/queries/company";
import { TRPCError } from "@trpc/server";

export const jobRouter = router({
	getJobFull: accountProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			return await JobQueryClient.GetExtendedById(input.id);
		}),
	createJob: accountProcedure
		.input(NewJobSchema)
		.mutation(async ({ ctx, input }) => {
			return await JobQueryClient.Create(input);
		}),
	editJob: accountProcedure
		.input(EditJobSchema)
		.mutation(async ({ ctx, input }) => {
			return await JobQueryClient.Update(input);
		}),
	deleteJob: accountProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			//TODO: verify user owns job before deleteion
			return await JobQueryClient.Delete(input.id);
		}),
	searchJobsByKeyword: accountProcedure
		.input(
			z.object({
				keywordQuery: z.string(),
				cursor: z.number().optional().default(1),
				pageSize: z.number().optional().default(10),
				includeDeleted: z.boolean().optional().default(false),
			})
		)
		.query(async ({ ctx, input }) => {
			const { keywordQuery, cursor, pageSize, includeDeleted } = input;

			return await JobQueryClient.GetBasicManyByKeyword(
				keywordQuery,
				cursor,
				pageSize,
				includeDeleted,
				ctx.account.id
			);
		}),
	recommendJobs: accountProcedure
		.input(
			z.object({
				cursor: z.number().optional().default(1),
				pageSize: z.number().optional().default(10),
				includeDeleted: z.boolean().optional().default(false),
			})
		)
		.query(async ({ ctx, input }) => {
			const { cursor, pageSize, includeDeleted } = input;
			const jqc = JobQueryClient;

			return await jqc.caller.transaction(async (tx) => {
				const recommendedJobs = await jqc
					.withCaller(tx)
					.GetBasicManyByUserReccomendation(
						ctx.account.id,
						cursor,
						pageSize,
						includeDeleted
					);

				// Track job recommendation
				await AnalyticQueryClient.withCaller(tx).TrackAccountJobRecommendation(
					recommendedJobs.data.map((job) => ({
						jobId: job.id,
						accountId: ctx.account.id,
					}))
				);

				return recommendedJobs;
			});
		}),
	favouriteJob: accountProcedure
		.input(z.object({ jobId: z.string(), accountId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const jqc = JobQueryClient;
			return await jqc.caller.transaction(async (tx) => {
				if (input.accountId !== ctx.account.id) {
					throw new Error("you cannot favourite a job for another account");
				}

				const ownedJobs = await jqc
					.withCaller(tx)
					.GetDetailedManyOwnedByAccountId(input.accountId);

				if (ownedJobs.some((job) => job.id === input.jobId)) {
					throw new Error("you cannot favourite a job you own");
				}

				await jqc.withCaller(tx).Favorite(input.accountId, input.jobId);
			});
		}),
	unfavouriteJob: accountProcedure
		.input(z.object({ jobId: z.string(), accountId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (input.accountId !== ctx.account.id) {
				throw new Error("you cannot unfavourite a job for another account");
			}

			return await JobQueryClient.Unfavorite(input.accountId, input.jobId);
		}),
	getIsJobFavouritedByAccountId: accountProcedure
		.input(z.object({ jobId: z.string().uuid(), accountId: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			if (input.accountId !== ctx.account.id) {
				throw new Error(
					"you cannot check if a job is favourited for another account"
				);
			}

			return await JobQueryClient.GetIsJobFavouritedByAccountId(
				ctx.account.id,
				input.jobId
			);
		}),
	getFavouritedJobs: accountProcedure
		.input(
			z.object({
				accountId: z.string().uuid(),
				cursor: z.number().optional().default(1),
				pageSize: z.number().optional().default(10),
				includeDeleted: z.boolean().optional().default(false),
			})
		)
		.query(async ({ ctx, input }) => {
			const { accountId, cursor, pageSize, includeDeleted } = input;

			if (accountId !== ctx.account.id) {
				throw new Error(
					"you cannot check if a job is favourited for another account"
				);
			}

			return await JobQueryClient.GetBasicManyFavouritedByAccountId(
				ctx.account.id,
				cursor,
				pageSize,
				includeDeleted
			);
		}),

	trackJobView: accountProcedure
		.input(z.object({ jobId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await AnalyticQueryClient.TrackAccountJobView(
				ctx.account.id,
				input.jobId
			);
		}),
	getMostPopularJobByCompanyId: companyOwnerProcedure
		.input(z.object({ companyId: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			const ownedCompanies = await CompanyQueryClient.GetDetailedManyByOwnerId(
				ctx.account.id
			);

			if (!ownedCompanies.some((company) => company.id === input.companyId)) {
				throw new Error(
					"cannot view the most popular jobs for a company you do not own"
				);
			}

			return await JobQueryClient.GetBasicMostPopularByCompanyId(
				input.companyId
			);
		}),
});
