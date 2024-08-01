const redirects = {
	home: "/",
	demo: "/demo",
	features: {
		sell: "/features/sell",
		buy: "/features/buy",
	},
	auth: {
		login: "/login",
		logout: "/logout",
		callback: "/auth/callback",
		afterLogin: "/overview",
		afterSignUp: "/login",
		afterLogout: "/",
	},
	dashboard: "/overview",
	pricing: "/pricing",
	about: "/about",
	contact: "/contact",
};

export default redirects;
