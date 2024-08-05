/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "www.featurebase.app",
			},
			{
				protocol: "https",
				hostname: "raikihpfxrmufirtxhvf.supabase.co",
			},
		],
	},
};
export default nextConfig;
