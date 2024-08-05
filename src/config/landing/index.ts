import redirects from "../redirects";
import featurePage from "./features";
import images from "./images";

const landing = {
	hero: {
		title: "Connect With The Right Professional & Make Informed Decisions",
		description:
			"No more guesswork. No more back and forth. Why waste your time and money on people who aren't the right fit for your project?",
		image: {
			src: images.landingImages.dashChart,
			alt: "Dashboard.",
			width: 1080,
			height: 1920,
		},
		cta: {
			label: "Get started",
			href: redirects.auth.login,
		},
		secondaryCta: {
			label: "Contact us",
			href: redirects.contact,
		},
	},
	features: [
		{
			title: "Explore Listings",
			description:
				"Search through our curated lists of companies and job listings to find the perfect team for your project or work for your crew.",
			image: {
				src: images.landingImages.exploreListings,
				alt: "Explore job listings.",
				width: 1080,
				height: 1920,
			},
			learnMoreLink: redirects.features.exploreListings,
		},
		{
			title: "Bid",
			description:
				"Submit or recieve bids on projects and get the best price and value for the work you need done.",
			image: {
				src: images.landingImages.dropBid,
				alt: "Drop a bid on a project.",
				width: 1080,
				height: 1920,
			},
			learnMoreLink: redirects.features.bid,
		},
		{
			title: "Discuss & Accept",
			description:
				"Talk with the person on the other side of the bid to truly get to know them before proceeding.",
			image: {
				src: images.landingImages.bidView,
				alt: "View a bid on a project.",
				width: 1080,
				height: 1920,
			},
			learnMoreLink: redirects.features.message,
		},
	],
	customers: [
		{
			name: "Envy Irrigation",
			image: {
				src: images.customerLogos.envyIrrgiation,
				alt: "The Featurebase feedback portal showing already received user feedback.",
				width: 1080,
				height: 1920,
			},
			href: "https://www.envyirrigation.ca/",
		},
		{
			name: "M.I.K.E Carpentry",
			image: {
				src: images.customerLogos.mikeCarpentry,
				alt: "The Featurebase feedback portal showing already received user feedback.",
				width: 1080,
				height: 1920,
			},
		},
		{
			name: "Window Force",
			image: {
				src: images.customerLogos.windowForce,
				alt: "The Featurebase feedback portal showing already received user feedback.",
				width: 1080,
				height: 1920,
			},
			href: "https://windowforce.ca/",
		},
		{
			name: "Bona Vista Pools",
			image: {
				src: images.customerLogos.bonaVista,
				alt: "The Featurebase feedback portal showing already received user feedback.",
				width: 1080,
				height: 1920,
			},
		},
	],
	navbar: [
		{
			label: "Features",
			submenu: featurePage.features.map((feat) => ({
				label: feat.group,
				href: `${feat.path}`,
			})),
		},
		{
			label: "Pricing",
			href: redirects.pricing,
		},
		{
			label: "Demo",
			href: redirects.demo,
		},
		{
			label: "Contact",
			href: redirects.contact,
		},
		{
			label: "About",
			href: redirects.about,
		},
	],
	cta: {
		label: "Get started",
		href: redirects.auth.login,
	},
	secondaryCta: {
		label: "Contact us",
		href: redirects.contact,
	},
};

export default landing;
