import { ReactNode } from "react";

export type Plan = {
	name: string;
	description: string;
	price: {
		annual: number;
		monthly: number;
	};
	featureSummary: string[];
	cta: string;
	highlight?: boolean;
};

const plans: Plan[] = [
	{
		name: "Starter",
		price: { annual: 12, monthly: 19 },
		description: "A basic plan for individuals.",
		featureSummary: ["Bidding", "Company Profile"],
		cta: "Get started for free",
	},
	{
		name: "Pro",
		price: { annual: 13, monthly: 25 },
		description: "A plan for individuals.",
		featureSummary: ["Everything in Starter", "CRM"],
		highlight: true,
		cta: "Get started for free",
	},
	{
		name: "Enterprise",
		price: { annual: 300, monthly: 450 },
		description: "A plan for qweqwe.",
		featureSummary: ["Everything in Pro", "Custom Domain"],
		cta: "Contact us",
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
