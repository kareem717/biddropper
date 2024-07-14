import redirects from "../redirects";

const landing = {
	hero: {
		title: "Featurebase",
		description: "A modern feedback tool for product teams.",
		image: {
			src: "https://www.featurebase.app/images/redesign/public_roadmap.jpg",
			alt: "The Featurebase feedback portal showing already received user feedback.",
			width: 1080,
			height: 1920,
		},
		cta: {
			label: "Get started",
			href: redirects.dashboard,
		},
		secondaryCta: {
			label: "Contact us",
			href: redirects.contact,
		},
	},
	features: [
		{
			title: "Sell",
			description:
				"Get a clear understanding of user needs and plan what to build next.",
			image: {
				src: "https://www.featurebase.app/images/redesign/2024-dashboard.png",
				alt: "The Featurebase feedback portal showing already received user feedback.",
				width: 1080,
				height: 1920,
			},
			learnMoreLink: "/features/sell",
		},
		{
			title: "Announce new releases",
			description:
				"Boost new feature awareness with constant updates and changelogs.",
			image: {
				src: "https://www.featurebase.app/images/redesign/2024-dashboard.png",
				alt: "The Featurebase feedback portal showing already received user feedback.",
				width: 1080,
				height: 1920,
			},
			learnMoreLink: "/features/announce-updates",
		},
		{
			title: "Feedback widget",
			description:
				"Collect feedback from your users in a beautiful widget and get insights into what they like and dislike.",
			image: {
				src: "https://www.featurebase.app/images/redesign/feedback-widget-demo-lighter.jpg",
				alt: "The Featurebase feedback portal showing already received user feedback.",
				width: 1080,
				height: 1920,
			},
			learnMoreLink: "https://www.featurebase.app/feedback-widget",
		},
	],
	customers: [
		{
			name: "TikTok",
			image: {
				src: "https://www.featurebase.app/images/nature.svg",
				alt: "The Featurebase feedback portal showing already received user feedback.",
				width: 1080,
				height: 1920,
			},
		},
		{
			name: "TikTok",
			image: {
				src: "https://www.featurebase.app/images/nature.svg",
				alt: "The Featurebase feedback portal showing already received user feedback.",
				width: 1080,
				height: 1920,
			},
			href: "https://www.featurebase.app/",
		},
		{
			name: "TikTok",
			image: {
				src: "https://www.featurebase.app/images/nature.svg",
				alt: "The Featurebase feedback portal showing already received user feedback.",
				width: 1080,
				height: 1920,
			},
			href: "https://www.featurebase.app/",
		},
	],
	navbar: [
		{
			label: "Features",
			submenu: [
				{
					label: "Sell",
					href: "/features/sell",
				},
			],
		},
		{
			label: "Pricing",
			href: "/pricing",
		},
		{
			label: "Demo",
			href: "/demo",
		},
		{
			label: "Contact",
			href: "/contact",
		},
		{
			label: "About",
			href: "/about",
		},
	],
	cta: {
		label: "Get started",
		href: redirects.dashboard,
	},
	secondaryCta: {
		label: "Contact us",
		href: redirects.contact,
	},
};

export default landing;
