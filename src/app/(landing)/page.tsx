
import { FeatureShowcase } from "@/components/jobs/landing/FeatureShowcase";
import { LandingHero } from "@/components/jobs/landing/Hero";
import { CustomerShowcase } from "@/components/jobs/landing/CustomerShowcase";
import LandingConfig from "@/config/landing";

export default function LandingPage() {
	return (
		<div className="flex flex-col h-full gap-20">
			<section className="pt-20 sm:pt-36">
				<LandingHero
					title={LandingConfig.hero.title}
					description={LandingConfig.hero.description}
					image={LandingConfig.hero.image}
					cta={LandingConfig.hero.cta}
					secondaryCta={LandingConfig.hero.secondaryCta}
				/>
			</section>
			<section className="pt-12 pb-20 sm:pb-32 space-y-20">
				<CustomerShowcase customers={LandingConfig.customers} />
				<FeatureShowcase features={LandingConfig.features} />
			</section>
		</div>
	);
}
