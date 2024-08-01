type NavItem = {
	title: string;
	urlPath: string;
	href?: string;
	subItems?: Omit<NavItem, "subItems">[];
};

const appNavConfig: NavItem[] = [
	{
		title: "Home",
		urlPath: "/overview",
		href: "/overview",
	},
	{
		title: "Explore",
		urlPath: "/explore",
		subItems: [
			{
				title: "Jobs",
				href: "/jobs",
				urlPath: "/jobs",
			},
			{
				title: "Companies",
				href: "/companies",
				urlPath: "/companies",
			},
		],
	},
	{
		title: "Inbox",
		urlPath: "/inbox",
		href: "/inbox",
	},
	{
		title: "History",
		urlPath: "/history",
		href: "/history",
	},
	{
		title: "Favourites",
		urlPath: "/favourites",
		subItems: [
			{
				title: "Saved Jobs",
				href: "/jobs",
				urlPath: "/jobs",
			},
			{
				title: "Saved Companies",
				href: "/companies",
				urlPath: "/companies",
			},
		],
	},
	{
		title: "Bids",
		urlPath: "/bids",
		href: "/bids",
	},
];

const myCompanyConfig = {
	title: "My Companies",
	urlPath: "/company",
	subItems: [
		{
			title: "Overview",
			urlPath: "/overview",
			href: "/overview",
		},
		{
			title: "Bids",
			urlPath: "/bids",
			subItems: [
				{
					title: "Recieved",
					urlPath: "/recieved",
				},
				{
					title: "Sent",
					urlPath: "/sent",
				},
			],
		},
		{
			title: "Edit",
			urlPath: "/edit",
			subItems: [
				{
					title: "Company",
					urlPath: "/company",
				},
				{
					title: "Job",
					urlPath: "/job",
				},
			],
		},
		{
			title: "Inbox",
			urlPath: "/inbox",
		},
		{
			title: "Create",
			urlPath: "/create",
		},
	],
};

const myJobsConfig = {
	title: "My Jobs",
	urlPath: "/jobs",
	subItems: [
		{
			title: "Edit",
			urlPath: "/edit",
			subItems: [
				{
					title: "Company",
					urlPath: "/company",
				},
				{
					title: "Job",
					urlPath: "/job",
				},
			],
		},
		{
			title: "Create",
			urlPath: "/create",
		},
	],
};

const config = {
	...appNavConfig,
	myCompanyConfig,
	myJobsConfig,
};

export default config;