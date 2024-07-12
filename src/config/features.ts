export type Feature = {
	name: string;
	description: string;
};

const features: {
	category: string;
	path: string;
	hero: {
		title: string;
		description: string;
	};
	features: Feature[];
}[] = [
	{
		category: "Real-Time",
		path: "/real-time",
		hero: {
			title: "Lorem ipsum dolor sit amet",
			description: "Get real-time data from your customers.",
		},
		features: [
			{
				name: "Real-Time",
				description: "Get real-time data from your customers.",
			},
			{
				name: "Real-Time",
				description: "Get real-time data from your customers.",
			},
			{
				name: "Real-Time",
				description: "Get real-time data from your customers.",
			},
		],
	},
	{
		category: "Sell",
		path: "/sell",
		hero: {
			title: "Lorem ipsum dolor sit amet",
			description: "Get real-time data from your customers.",
		},
		features: [
			{
				name: "Sell",
				description: "Get real-time data from your customers.",
			},
			{
				name: "Sell",
				description: "Get real-time data from your customers.",
			},
			{
				name: "Sell",
				description: "Get real-time data from your customers.",
			},
		],
	},
];

const featurePage = {
	footer: {
		title: "Create your feedback community and give your users a voice",
		description: "Get real-time data from your customers.",
	},
	features,
};

export default featurePage;
