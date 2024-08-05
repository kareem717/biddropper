const redirects = {
	home: "/",
	demo: "/demo",
	bids: "/bids",
	auth: {
		login: "/login",
		logout: "/logout",
		callback: "/auth/callback",
		createAccount: "/create-account",
		afterLogin: "/overview",
		afterSignUp: "/login",
		afterLogout: "/",
	},
	favourites: {
		jobs: "/favourites/jobs",
		companies: "/favourites/companies",
	},
	myJobs: "/my-jobs",
	myCompanies: "/my-companies",
	explore: {
		jobs: "/explore/jobs",
		companies: "/explore/companies",
	},
	features: {
		exploreListings: "/features/explore-listings",
		bid: "/features/bid",
		message: "/features/message",
		jobs: "/features/jobs",
		favourites: "/features/favourites",
		companyShowcase: "/features/company-showcase",
		insights: "/features/insights",
	},
	history: "/history",
	inbox: "/inbox",
	overview: "/overview",
	pricing: "/pricing",
	settings: "/settings",
	about: "/about",
	contact: "/contact",
};

export default redirects;
