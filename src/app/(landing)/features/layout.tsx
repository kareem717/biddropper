
import { FeatureFooter } from "@/components/landing/features/FeatureFooter";
import FeaturesConfig from "@/config/landing/features";

export default async function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
      <section className="my-6">
        <FeatureFooter
          cta={FeaturesConfig.footer.cta}
          secondaryCta={FeaturesConfig.footer.secondaryCta}
        />
      </section>
    </div>
  );
}
