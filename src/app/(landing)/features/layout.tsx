
import { FeatureFooter } from "@/components/landing/features/FeatureFooter";

export default async function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
      <section className="my-6">
        <FeatureFooter />
      </section>
    </div>
  );
}
