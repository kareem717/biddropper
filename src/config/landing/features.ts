import { Icons } from "@/components/Icons";
import { CTA, Image } from "../types";
import redirects from "../redirects";
import images from "./images";

export type FeatureDetail = {
	name: string;
	description: string;
	icon: keyof typeof Icons;
};

export type FeatureCard = {
	header: string;
	description: string;
	image: {
		src: string;
		alt: string;
		width: number;
		height: number;
	};
	details: FeatureDetail[];
};

export type FeatureGroup = {
	group: string;
	path: string;
	hero: {
		title: string;
		description: string;
		image: Image;
		cta: CTA;
		secondaryCta: CTA;
	};
	cards: FeatureCard[];
};

const features: FeatureGroup[] = [
	{
		group: "Explore Listings",
		path: redirects.features.exploreListings,
		hero: {
			title: "View curated jobs and companies that will help you grow",
			description:
				"Explore our vast list of oppurtunities and companies to find the right fit for you.",
			image: {
				src: images.landingImages.exploreCompanies,
				alt: "Explore companies.",
				width: 3321,
				height: 2103,
			},
			cta: {
				label: "Sign up for free",
				href: redirects.auth.login,
			},
			secondaryCta: {
				label: "See it in action",
				href: redirects.demo,
			},
		},
		cards: [
			{
				header: "Distance",
				description:
					"Filter through companies and jobs to make sure they're within your area.",
				image: {
					src: images.landingImages.distance,
					alt: "Filter companies and jobs by distance.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Display.",
						description:
							"Each company and job has a attached address, companies also include a service area to ensure that they can work at your next project.",
						icon: "map",
					},
					{
						name: "Filter.",
						description:
							"Filter through companies and jobs to make sure they're within your area.",
						icon: "filter",
					},
				],
			},
			{
				header: "Industry",
				description: "Search through industry specific projects and companies.",
				image: {
					src: images.landingImages.industry,
					alt: "Filter companies and jobs by industry.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Search",
						description:
							"Search through industry specific projects and companies.",
						icon: "search",
					},
					{
						name: "20+ Industries",
						description: "biddropper gives users access to over 20 industries.",
						icon: "radio",
					},
				],
			},
		],
	},
	{
		group: "Bids",
		path: redirects.features.bid,
		hero: {
			title: "Send & Receive Bids",
			description: "Send bids on projects and receive bids from companies.",
			image: {
				src: images.landingImages.bidView,
				alt: "View a bid on a project.",
				width: 3321,
				height: 2103,
			},
			cta: {
				label: "Sign up for free",
				href: redirects.auth.login,
			},
			secondaryCta: {
				label: "See it in action",
				href: redirects.demo,
			},
		},
		cards: [
			{
				header: "Compare",
				description: "Getting multiple bids on a project is important.",
				image: {
					src: images.landingImages.multiBids,
					alt: "Get multiple bids on a project.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Communicate value.",
						description:
							"Companies can provide additional information alognside sending their offer to not only show their value but also to help you make a decision.",
						icon: "chart",
					},
					{
						name: "Options.",
						description:
							"Get multiple bids on a project to ensure you're getting the best price and the right person.",
						icon: "radio",
					},
				],
			},
			{
				header: "Request Information",
				description:
					"Use our in-app messaging to request more information from companies or your potential client before sending a bid.",
				image: {
					src: images.landingImages.requestInfo,
					alt: "Request information from a company.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "In-App Messaging",
						description:
							"Easily communicate with companies or clients directly within the app.",
						icon: "message",
					},
					{
						name: "Request Details",
						description:
							"Ask for more information about a project or company before making a decision.",
						icon: "info",
					},
					{
						name: "Track Conversations",
						description:
							"Keep a record of all your communications for future reference.",
						icon: "history",
					},
				],
			},
			{
				header: "Be Confident",
				description: "Get real-time data from your customers.",
				image: {
					src: images.landingImages.bidDecide,
					alt: "Decide on a bid.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Statistics.",
						description:
							"See how many bids have been sent and received on a project.",
						icon: "radio",
					},
					{
						name: "Market Value.",
						description:
							"See the market value of a project and how it compares to other bids.",
						icon: "radio",
					},
					{
						name: "Bid History.",
						description:
							"See the history of bids on a project and how they've changed over time.",
						icon: "radio",
					},
				],
			},
		],
	},
	{
		group: "Messages",
		path: redirects.features.message,
		hero: {
			title: "Stay Connected with Real-Time Messaging",
			description: "Communicate instantly with your customers and team.",
			image: {
				src: images.landingImages.inbox,
				alt: "Inbox.",
				width: 3321,
				height: 2103,
			},
			cta: {
				label: "Sign up for free",
				href: "https://auth.featurebase.app/register",
			},
			secondaryCta: {
				label: "See it in action",
				href: "/demo",
			},
		},
		cards: [
			{
				header: "Instant Notifications",
				description: "Receive notifications for new messages in real-time.",
				image: {
					src: images.landingImages.notifications,
					alt: "Notifications.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Email Alerts",
						description: "Receive email alerts for important messages.",
						icon: "message",
					},
				],
			},
			{
				header: "Message History",
				description: "Keep a record of all your communications.",
				image: {
					src: images.landingImages.reply,
					alt: "Reply to a message.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Searchable History",
						description: "Easily search through your message history.",
						icon: "search",
					},
					{
						name: "Archived Messages",
						description: "Archive old messages for future reference.",
						icon: "trash",
					},
				],
			},
			{
				header: "Secure Messaging",
				description: "Ensure your communications are private and secure.",
				image: {
					src: images.landingImages.message,
					alt: "Message.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Data Privacy",
						description: "Your data is stored securely and privately.",
						icon: "lock",
					},
				],
			},
		],
	},
	{
		group: "Insights",
		path: redirects.features.insights,
		hero: {
			title: "Get the full picture of how your company and jobs are performing",
			description: "See how your company and jobs are performing in real-time.",
			image: {
				src: images.landingImages.dashChart,
				alt: "Dashboard chart.",
				width: 3321,
				height: 2103,
			},
			cta: {
				label: "Sign up for free",
				href: "https://auth.featurebase.app/register",
			},
			secondaryCta: {
				label: "See it in action",
				href: "/demo",
			},
		},
		cards: [
			{
				header: "Real-Time Insights",
				description: "Get real-time data from your customers.",
				image: {
					src: images.landingImages.metrics,
					alt: "Metrics.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "User Feedback",
						description:
							"Collect and analyze feedback to improve your services.",
						icon: "user",
					},
					{
						name: "Performance Metrics",
						description: "Track key performance indicators to measure success.",
						icon: "chart",
					},
				],
			},
			{
				header: "Customer Engagement",
				description: "Enhance customer engagement with real-time interactions.",
				image: {
					src: images.landingImages.engagement,
					alt: "Engagement.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Instant Notifications",
						description:
							"Send instant notifications to keep customers informed.",
						icon: "mailPlus",
					},
					{
						name: "Feedback Loop",
						description:
							"Create a continuous feedback loop to improve customer satisfaction.",
						icon: "repeat",
					},
				],
			},
		],
	},
];

const featurePage = {
	footer: {
		title:
			"Get the full picture of what your project entails and become a informed buyer",
		description:
			"Weather you're a contractor or want to take on a project, biddropper allows you to work on the right thing with the right people",
		cta: {
			label: "Sign up for free",
			href: redirects.auth.login,
		},
		secondaryCta: {
			label: "See it in action",
			href: redirects.demo,
		},
	},
	features,
};

export default featurePage;
