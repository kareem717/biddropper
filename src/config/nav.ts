type NavItem = {
	title: string;
	urlPath: string;
	href?: string;
	subItems?: {
		title: string;
		href: string;
		urlPath: string;
	}[];
};

const appNavConfig: NavItem[] = [
	{
		title: "Home",
		urlPath: "overview",
		href: "/overview",
	},
	{
		title: "Explore",
		urlPath: "explore",
		subItems: [
			{
				title: "Jobs",
				href: "/jobs",
				urlPath: "jobs",
			},
			{
				title: "Companies",
				href: "/companies",
				urlPath: "companies",
			},
		],
	},
  {
		title: "My Companies",
		urlPath: "my-companies",
		href: "/my-companies",
	},
  {
		title: "My Jobs",
		urlPath: "my-jobs",
		href: "/my-jobs",
	},
	{
		title: "Inbox",
		urlPath: "inbox",
		href: "/inbox",
	},
	{
		title: "History",
		urlPath: "history",
		href: "/history",
	},
	{
		title: "Favourites",
		urlPath: "favourites",
		subItems: [
			{
				title: "Saved Jobs",
				href: "/jobs",
				urlPath: "jobs",
			},
			{
				title: "Saved Companies",
				href: "/companies",
				urlPath: "companies",
			},
		],
	},
	{
		title: "Bids",
		urlPath: "bids",
		href: "/bids",
	},
];

export default appNavConfig;
