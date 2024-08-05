import { Metadata } from "next";
import FeatureConfig from "@/config/landing/features";
import { FeatureHero } from "@/components/landing/features/FeatureHero";
import { FeatureCard } from "@/components/landing/features/FeatureCard";
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
	title: "Features",
	description: "Features",
};

export default function FeaturesPage({ params }: { params: { feat: string } }) {
	const feature = FeatureConfig.features.find((feature) => feature.path.split("/").pop() === params.feat);

	console.log(FeatureConfig.features.map((feature) => feature.path.split("/").pop()));
	if (!feature) {
		notFound();
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
