import { z } from "zod";
import { accountProcedure, publicProcedure, router } from "../trpc";
import { resend } from "@/lib/email";
import { env } from "@/lib/env.mjs";
import { randomInt } from "crypto";
import { SupportRequestEmail } from "@/components/emails/SupportRequest";
import { ContactUsCallbackEmail } from "@/components/emails/ContactUs";
import {
	DemoRequestEmail,
	DemoRequestCallbackEmail,
} from "@/components/emails/DemoRequest";
import demo from "@/config/landing/demo";

export const emailRouter = router({
	submitFeedback: accountProcedure
		.input(
			z.object({
				email: z.string().email(),
				message: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { email, message } = input;

			await resend.emails.send({
				from: email,
				to: [env.NEXT_PUBLIC_OUTREACH_EMAIL],
				subject: "Feedback",
				text: `Feedback from account ${ctx.account.id}: ${message}`,
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

			await resend.emails.send({
				from: `Support <${env.NEXT_PUBLIC_SUPPORT_EMAIL}>`,
				to: [email, env.NEXT_PUBLIC_SUPPORT_EMAIL],
				subject: `Support Request #${requestId}`,
				text: `Support request from ${ctx.account.username}: ${message}`, // Added text property
				react: SupportRequestEmail({
					name: ctx.account.username,
					requestText: message,
					requestId,
				}),
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

			await resend.emails.send({
				from: env.NEXT_PUBLIC_SUPPORT_EMAIL,
				to: [env.NEXT_PUBLIC_SUPPORT_EMAIL],
				subject: `Contact`,
				text: `Contact us request from ${name} <${email}>: ${message}`, // Added text property
				react: ContactUsCallbackEmail({
					name,
					email,
					message,
				}),
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
			await resend.emails.send({
				from: env.NEXT_PUBLIC_SALES_EMAIL,
				to: [env.NEXT_PUBLIC_SALES_EMAIL],
				subject: `Demo Request`,
				text: `Demo request`, // Added text property
				react: DemoRequestCallbackEmail(input),
			});

			await resend.emails.send({
				from: `Sales <${env.NEXT_PUBLIC_SALES_EMAIL}>`,
				to: [input.email],
				subject: `Demo Request`,
				text: `We received your demo request. We will review your request and get back to you shortly. If you have any questions, please email us at ${env.NEXT_PUBLIC_SUPPORT_EMAIL}`, // Added text property
				react: DemoRequestEmail(),
			});
		}),
});
