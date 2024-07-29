import { z } from "zod";
import { accountProcedure, publicProcedure, router } from "../trpc";
import { env } from "@/lib/env.mjs";
import { randomInt } from "crypto";
import {
	SupportRequestEmailHTML,
} from "@/components/emails/SupportRequest";
import { ContactUsEmailHTML } from "@/components/emails/ContactUs";
import {
	DemoRequestCallbackEmailHTML,
	DemoRequestEmailHTML,
} from "@/components/emails/DemoRequest";
import demo from "@/config/landing/demo";
import ses from "@/lib/aws/ses";
import { TRPCError } from "@trpc/server";

export const emailRouter = router({
	submitFeedback: accountProcedure
		.input(
			z.object({
				email: z.string().email(),
				message: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const params = {
				Source: `Feedback <${env.NEXT_PUBLIC_SUPPORT_EMAIL}>`,
				Destination: {
					ToAddresses: [input.email, env.NEXT_PUBLIC_SUPPORT_EMAIL],
				},
				Message: {
					Body: {
						Html: {
							Charset: "UTF-8",
							Data: ContactUsEmailHTML(input),
						},
					},
					Subject: {
						Charset: "UTF-8",
						Data: "Feedback",
					},
				},
			};

			await ses.sendEmail(params, (err, data) => {
				if (err) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: err.message,
					});
				}
			});
		}),
	submitSupportRequest: accountProcedure
		.input(
			z.object({
				email: z.string().email(),
				message: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { email, message } = input;

			const requestId = randomInt(0, 9999999).toString();

			const params = {
				Source: `Support <${env.NEXT_PUBLIC_SUPPORT_EMAIL}>`,
				Destination: {
					ToAddresses: [email, env.NEXT_PUBLIC_SUPPORT_EMAIL],
				},
				Message: {
					Body: {
						Html: {
							Charset: "UTF-8",
							Data: SupportRequestEmailHTML({
								name: ctx.account.username,
								requestText: message,
								requestId,
							}),
						},
					},
					Subject: {
						Charset: "UTF-8",
						Data: "Support Request",
					},
				},
			};

			await ses.sendEmail(params, (err, data) => {
				if (err) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: err.message,
					});
				}
			});
		}),
	submitContactUs: publicProcedure
		.input(
			z.object({
				name: z.string(),
				email: z.string().email(),
				message: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { name, email, message } = input;

			const params = {
				Source: `Support <${env.NEXT_PUBLIC_SUPPORT_EMAIL}>`,
				Destination: {
					ToAddresses: [email, env.NEXT_PUBLIC_SUPPORT_EMAIL],
				},
				Message: {
					Body: {
						Html: {
							Charset: "UTF-8",
							Data: ContactUsEmailHTML({
								name,
								email,
								message,
							}),
						},
					},
					Subject: {
						Charset: "UTF-8",
						Data: "Contact Us",
					},
				},
			};

			await ses.sendEmail(params, (err, data) => {
				if (err) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: err.message,
					});
				}
			});
		}),
	submitDemoRequest: publicProcedure
		.input(
			z.object({
				firstName: z
					.string()
					.min(2, {
						message: "First name must be at least 2 characters.",
					})
					.max(400, {
						message: "First name must be less than 400 characters.",
					}),
				lastName: z
					.string()
					.min(2, {
						message: "Last name must be at least 2 characters.",
					})
					.max(400, {
						message: "Last name must be less than 400 characters.",
					}),
				email: z
					.string()
					.email({
						message: "Invalid email address.",
					})
					.max(400, {
						message: "Email must be less than 400 characters.",
					}),
				companyName: z
					.string()
					.min(1, {
						message: "Company name must be at least 1 character.",
					})
					.max(300, {
						message: "Company name must be less than 300 characters.",
					}),
				role: z.string().max(100, {
					message: "Role must be less than 100 characters.",
				}),
				interestedIn: z.array(
					z.enum(
						demo.requestForm.interestedInOptions.map(
							(option) => option.value
						) as [string, ...string[]]
					)
				),
				useCase: z.string().max(10000, {
					message: "Use case must be less than 10,000 characters.",
				}),
				heardFrom: z.string().max(500, {
					message: "Heard from must be less than 500 characters.",
				}),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const callbackParams = {
				Source: `Sales <${env.NEXT_PUBLIC_SALES_EMAIL}>`,
				Destination: {
					ToAddresses: [env.NEXT_PUBLIC_SALES_EMAIL],
				},
				Message: {
					Body: {
						Html: {
							Charset: "UTF-8",
							Data: DemoRequestCallbackEmailHTML(input),
						},
					},
					Subject: {
						Charset: "UTF-8",
						Data: "Demo Request Callback",
					},
				},
			};

			await ses.sendEmail(callbackParams, (err, data) => {
				if (err) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: err.message,
					});
				}
			});

			const outboundParams = {
				Source: `Sales <${env.NEXT_PUBLIC_SALES_EMAIL}>`,
				Destination: {
					ToAddresses: [input.email],
				},
				Message: {
					Body: {
						Html: {
							Charset: "UTF-8",
							Data: DemoRequestEmailHTML(input),
						},
					},
					Subject: {
						Charset: "UTF-8",
						Data: "Demo Request",
					},
				},
			};

			await ses.sendEmail(outboundParams, (err, data) => {
				if (err) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: err.message,
					});
				}
			});
		}),
});
