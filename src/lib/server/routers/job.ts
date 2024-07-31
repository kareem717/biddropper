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
			try {
				return await JobQueryClient.GetExtendedById(input.id);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to get job details",
					cause: error,
				});
			}
		}),
	createJob: accountProcedure
		.input(NewJobSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				return await JobQueryClient.Create(input);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create job",
					cause: error,
				});
			}
		}),
	editJob: accountProcedure
		.input(EditJobSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				return await JobQueryClient.Update(input);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update job",
					cause: error,
				});
			}
		}),
	deleteJob: accountProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				//TODO: verify user owns job before deleteion
				return await JobQueryClient.Delete(input.id);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to delete job",
					cause: error,
				});
			}
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
			try {
				return await JobQueryClient.GetBasicManyByKeyword(
					keywordQuery,
					cursor,
					pageSize,
					includeDeleted,
					ctx.account.id
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to search jobs",
					cause: error,
				});
			}
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
				let recommendedJobs;
				try {
					recommendedJobs = await jqc
						.withCaller(tx)
						.GetBasicManyByUserReccomendation(
							ctx.account.id,
							cursor,
							pageSize,
							includeDeleted
						);
				} catch (error) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to get recommended jobs",
						cause: error,
					});
				}

				try {
					// Track job recommendation
					await AnalyticQueryClient.withCaller(
						tx
					).TrackAccountJobRecommendation(
						recommendedJobs.data.map((job) => ({
							jobId: job.id,
							accountId: ctx.account.id,
						}))
					);
				} catch (error) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to recommend jobs",
						cause: error,
					});
				}
				return recommendedJobs;
			});
		}),
	favouriteJob: accountProcedure
		.input(z.object({ jobId: z.string(), accountId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (input.accountId !== ctx.account.id) {
				throw new Error("you cannot favourite a job for another account");
			}

			const jqc = JobQueryClient;

			let ownedJobs;
			try {
				ownedJobs = await jqc.GetDetailedManyOwnedByAccountId(input.accountId);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to get owned jobs",
					cause: error,
				});
			}

			if (ownedJobs.some((job) => job.id === input.jobId)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "you cannot favourite a job you own",
				});
			}

			try {
				await jqc.Favorite(input.accountId, input.jobId);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to favourite job",
					cause: error,
				});
			}
		}),
	unfavouriteJob: accountProcedure
		.input(z.object({ jobId: z.string(), accountId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (input.accountId !== ctx.account.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You cannot unfavourite a job for another account",
				});
			}

			try {
				return await JobQueryClient.Unfavorite(input.accountId, input.jobId);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to unfavourite job",
					cause: error,
				});
			}
		}),
	getIsJobFavouritedByAccountId: accountProcedure
		.input(z.object({ jobId: z.string().uuid(), accountId: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			if (input.accountId !== ctx.account.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"You cannot check if a job is favourited for another account",
				});
			}

			try {
				return await JobQueryClient.GetIsJobFavouritedByAccountId(
					ctx.account.id,
					input.jobId
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to check if job is favourited",
					cause: error,
				});
			}
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
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"You cannot check if a job is favourited for another account",
				});
			}

			try {
				return await JobQueryClient.GetBasicManyFavouritedByAccountId(
					ctx.account.id,
					cursor,
					pageSize,
					includeDeleted
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to get favourited jobs",
					cause: error,
				});
			}
		}),

	trackJobView: accountProcedure
		.input(z.object({ jobId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			try {
				return await AnalyticQueryClient.TrackAccountJobView(
					ctx.account.id,
					input.jobId
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to track job view",
					cause: error,
				});
			}
		}),
	getMostPopularJobByCompanyId: companyOwnerProcedure
		.input(z.object({ companyId: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			if (
				!ctx.ownedCompanies.some((company) => company.id === input.companyId)
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"You cannot view the most popular jobs for a company you do not own",
				});
			}

			try {
				return await JobQueryClient.GetBasicMostPopularByCompanyId(
					input.companyId
				);
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to get most popular job",
					cause: error,
				});
			}
		}),
});
