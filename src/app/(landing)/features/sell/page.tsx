import { Metadata } from "next";
import FeatureConfig from "@/config/landing/features";
import { FeatureHero } from "@/components/jobs/landing/features/FeatureHero";
import { FeatureCard } from "@/components/jobs/landing/features/FeatureCard";

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
		<div>
			<section>
				<FeatureHero
					title={feature.hero.title}
					description={feature.hero.description}
					image={feature.hero.image}
					cta={feature.hero.cta}
					secondaryCta={feature.hero.secondaryCta}
				/>
			</section>
			<section>
				{feature.cards.map((card, index) => (
					<FeatureCard
						key={index}
						header={card.header}
						description={card.description}
						image={card.image}
						points={card.details}
						orientation={index % 2 === 0 ? "left" : "right"}
					/>
				))}
			</section>
		</div>
	);
}
