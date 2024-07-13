import { Icons } from "@/components/Icons";
import { CTA, Image } from "../types";

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
		group: "Real-Time",
		path: "/sell",
		hero: {
			title: "Lorem ipsum dolor sit amet",
			description: "Get real-time data from your customers.",
			image: {
				src: "https://www.featurebase.app/images/redesign/public_roadmap.jpg",
				alt: "The Featurebase feedback portal showing already received user feedback.",
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
				header: "Real-Time",
				description: "Get real-time data from your customers.",
				image: {
					src: "https://www.featurebase.app/images/redesign/public_roadmap.jpg",
					alt: "The Featurebase feedback portal showing already received user feedback.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
				],
			},
			{
				header: "Real-Time",
				description: "Get real-time data from your customers.",
				image: {
					src: "https://www.featurebase.app/images/redesign/public_roadmap.jpg",
					alt: "The Featurebase feedback portal showing already received user feedback.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
				],
			},
			{
				header: "Real-Time",
				description: "Get real-time data from your customers.",
				image: {
					src: "https://www.featurebase.app/images/redesign/public_roadmap.jpg",
					alt: "The Featurebase feedback portal showing already received user feedback.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
				],
			},
		],
	},
	{
		group: "Real-Time 3",
		path: "/real-time3",
		hero: {
			title: "Lorem ipsum dolor sit amet",
			description: "Get real-time data from your customers.",
			image: {
				src: "https://www.featurebase.app/images/redesign/public_roadmap.jpg",
				alt: "The Featurebase feedback portal showing already received user feedback.",
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
				header: "Real-Time",
				description: "Get real-time data from your customers.",
				image: {
					src: "https://www.featurebase.app/images/redesign/public_roadmap.jpg",
					alt: "The Featurebase feedback portal showing already received user feedback.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
				],
			},
			{
				header: "Real-Time",
				description: "Get real-time data from your customers.",
				image: {
					src: "https://www.featurebase.app/images/redesign/public_roadmap.jpg",
					alt: "The Featurebase feedback portal showing already received user feedback.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
				],
			},
			{
				header: "Real-Time",
				description: "Get real-time data from your customers.",
				image: {
					src: "https://www.featurebase.app/images/redesign/public_roadmap.jpg",
					alt: "The Featurebase feedback portal showing already received user feedback.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
				],
			},
		],
	},
	{
		group: "Real-Time 2",
		path: "/real-time2",
		hero: {
			title: "Lorem ipsum dolor sit amet",
			description: "Get real-time data from your customers.",
			image: {
				src: "https://www.featurebase.app/images/redesign/public_roadmap.jpg",
				alt: "The Featurebase feedback portal showing already received user feedback.",
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
				header: "Real-Time",
				description: "Get real-time data from your customers.",
				image: {
					src: "https://www.featurebase.app/images/redesign/public_roadmap.jpg",
					alt: "The Featurebase feedback portal showing already received user feedback.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
				],
			},
			{
				header: "Real-Time",
				description: "Get real-time data from your customers.",
				image: {
					src: "https://www.featurebase.app/images/redesign/public_roadmap.jpg",
					alt: "The Featurebase feedback portal showing already received user feedback.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
				],
			},
			{
				header: "Real-Time",
				description: "Get real-time data from your customers.",
				image: {
					src: "https://www.featurebase.app/images/redesign/public_roadmap.jpg",
					alt: "The Featurebase feedback portal showing already received user feedback.",
					width: 3321,
					height: 2103,
				},
				details: [
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
					{
						name: "Communicate progress.",
						description:
							"Give your users a sense of control by communicating progress on features.",
						icon: "radio",
					},
				],
			},
		],
	},
];

const featurePage = {
	footer: {
		title: "Create your feedback community and give your users a voice",
		description: "Get real-time data from your customers.",
		cta: {
			label: "Sign up for free",
			href: "https://auth.featurebase.app/register",
		},
		secondaryCta: {
			label: "See it in action",
			href: "/demo",
		},
	},
	features,
};

export default featurePage;
