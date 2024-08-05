import { CTA } from "../types";
import redirects from "../redirects";

export type Plan = {
	name: string;
	description: string;
	price?: {
		annual: number;
		monthly: number;
	};
	featureSummary: string[];
	cta: CTA;
	highlight?: boolean;
};

const plans: Plan[] = [
	{
		name: "Customer",
		price: { annual: 0, monthly: 0 },
		description: "A basic plan for individuals.",
		featureSummary: [
			"Unlimited job posting under $15k",
			"Unlimited recieved bids",
			"Unlimited messages",
			"1% service fees on jobs between $15k and $500k, maximum of $1k per job",
			"Up to 2 jobs between $15k and $500k per month",
		],
		cta: {
			label: "Get started for free",
			href: redirects.auth.login,
		},
	},
	{
		name: "Contractor",
		price: { annual: 24.99, monthly: 29.99 },
		description: "A plan for small businesses.",
		featureSummary: [
			"Everything in Customer",
			"Company profile",
			"Up to 15 jobs under $500k per month",
			"Up to 3 accepted bids per month",
			"0.5% service fees on jobs under $500k",
			"0.1% service fees on jobs between $500k and $2M",
		],
		highlight: true,
		cta: {
			label: "Get started",
			href: redirects.auth.login,
		},
	},
	{
		name: "Enterprise",
		description: "A plan for large scale commercial clients.",
		featureSummary: [
			"Everything in Contractor",
			"Subcontracting",
			"Unlimited job postings",
			"Exclusive service fees",
			"Unlimited accepted bids",
		],
		cta: {
			label: "Contact us",
			href: redirects.contact,
		},
	},
];

const hero = {
	title: "More affordable than paying twice for the same service",
	description:
		"Simple pricing with no hidden fees. Free plan & no card required.",
};

const pricing = {
	hero,
	plans,
};

export default pricing;
