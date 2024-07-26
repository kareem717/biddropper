import { PricingHero } from "@/components/landing/pricing/PricingHero";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Pricing",
};

export default function PricingPage() {
  return (
    <div>
      <section className="md:my-20 my-10">
        <PricingHero />
      </section>
    </div>
  );
}
