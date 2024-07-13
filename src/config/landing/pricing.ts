import { CTA } from "../types";

export type Plan = {
	name: string;
	description: string;
	price: {
		annual: number;
		monthly: number;
	};
	featureSummary: string[];
	cta: CTA;
	highlight?: boolean;
};

const plans: Plan[] = [
	{
		name: "Starter",
		price: { annual: 12, monthly: 19 },
		description: "A basic plan for individuals.",
		featureSummary: ["Bidding", "Company Profile"],
		cta: {
			label: "Get started for free",
			href: "/get-started",
		},
	},
	{
		name: "Pro",
		price: { annual: 13, monthly: 25 },
		description: "A plan for individuals.",
		featureSummary: ["Everything in Starter", "CRM"],
		highlight: true,
		cta: {
			label: "Get started for free",
			href: "/get-started",
		},
	},
	{
		name: "Enterprise",
		price: { annual: 300, monthly: 450 },
		description: "A plan for qweqwe.",
		featureSummary: ["Everything in Pro", "Custom Domain"],
		cta: {
			label: "Contact us",
			href: "/contact",
		},
	},
];

const hero = {
	title: "More affordable than building the wrong features",
	description:
		"Simple pricing, no hidden fees. Free plan &amp; trials. No credit card required.",
};

const pricing = {
	hero,
	plans,
};

export default pricing;
