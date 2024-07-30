import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: "https://biddropper.com",
			lastModified: new Date(),
			// alternates: {
			// 	languages: {
			// 		es: "https://acme.com/es",
			// 		de: "https://acme.com/de",
			// 	},
			// },
			changeFrequency: "yearly",
			priority: 1,
		},
	];
}
