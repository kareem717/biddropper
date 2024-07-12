import { Metadata } from "next";
import FeatureConfig from "@/config/features";
import { FeatureHero } from "@/components/landing/features/FeatureHero";
import { FeatureCard } from "@/components/landing/features/FeatureCard";
import { Icons } from "@/components/Icons";

export const metadata: Metadata = {
	title: "Features",
	description: "Features",
};

export default function SellFeaturesPage() {
	const feature = FeatureConfig.features.find((feature) => feature.path === "/sell");

	if (!feature) {
		throw new Error("Feature not found");
	}

	return (
		<>
			<section>
				<FeatureHero title={feature.hero.title} description={feature.hero.description} />
			</section>
			<section>
				<FeatureCard
					header="Save countless hours by communicating one-to-many"
					description="Rather than communicating with each user individually, you can give customers a broader context of the product's development and automatically keep them in the loop about the progress of ongoing features."
					imageSrc="https://www.featurebase.app/images/redesign/optimized_upvoter_email.jpg"
					points={[
						{
							name: "Automatic email updates.",
							description: "When you update a feature, your users will automatically be notified via email.",
							icon: "mail"
						},
						{
							name: "Public roadmap.",
							description: "Create a public roadmap to show your users what you are working on and what is coming up next.",
							icon: "map"
						},
						{
							name: "Communicate progress.",
							description: "Give your users a sense of control by communicating progress on features.",
							icon: "radio"
						}
					]} />
				<FeatureCard
					header="Save countless hours by communicating one-to-many"
					description="Rather than communicating with each user individually, you can give customers a broader context of the product's development and automatically keep them in the loop about the progress of ongoing features."
					imageSrc="https://www.featurebase.app/images/redesign/optimized_upvoter_email.jpg"
					points={[
						{
							name: "Automatic email updates.",
							description: "When you update a feature, your users will automatically be notified via email.",
							icon: "mail"
						},
						{
							name: "Public roadmap.",
							description: "Create a public roadmap to show your users what you are working on and what is coming up next.",
							icon: "map"
						},
						{
							name: "Communicate progress.",
							description: "Give your users a sense of control by communicating progress on features.",
							icon: "radio"
						}
					]}
					orientation="right"
				/>
				<FeatureCard
					header="Save countless hours by communicating one-to-many"
					description="Rather than communicating with each user individually, you can give customers a broader context of the product's development and automatically keep them in the loop about the progress of ongoing features."
					imageSrc="https://www.featurebase.app/images/redesign/optimized_upvoter_email.jpg"
					points={[
						{
							name: "Automatic email updates.",
							description: "When you update a feature, your users will automatically be notified via email.",
							icon: "mail"
						},
						{
							name: "Public roadmap.",
							description: "Create a public roadmap to show your users what you are working on and what is coming up next.",
							icon: "map"
						},
						{
							name: "Communicate progress.",
							description: "Give your users a sense of control by communicating progress on features.",
							icon: "radio"
						}
					]} />
			</section>
		</>
	);
}
