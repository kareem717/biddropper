import { z } from "zod";
import { accountProcedure, router } from "../trpc";
import { resend } from "@/lib/email";
import { env } from "@/lib/env.mjs";
import { randomInt } from "crypto";
import { SupportRequestEmail } from "@/components/emails/SupportRequest";

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
});
