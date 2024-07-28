const redirects = {
	home: "/",
	demo: "/demo",
	features: {
		sell: "/features/sell",
		buy: "/features/buy",
	},
	auth: {
		login: "/login",
		signUp: "/sign-up",
		logout: "/logout",
		callback: "/auth/callback",
		afterLogin: "/dashboard",
		afterSignUp: "/login",
		afterLogout: "/",
	},
	dashboard: "/dashboard",
	pricing: "/pricing",
	about: "/about",
	contact: "/contact",
};

export default redirects;
