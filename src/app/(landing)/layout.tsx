
import { LandingFooter } from "@/components/landing/Footer";
import { LandingNavBar } from "@/components/landing/NavBar";
import LandingConfig from "@/config/landing";

export default async function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className="flex flex-col h-full relative">
      <LandingNavBar className="w-full h-12 sm:h-16" items={LandingConfig.navbar} cta={LandingConfig.cta} secondaryCta={LandingConfig.secondaryCta} />
      <main className="flex-1 mt-10 sm:mt-16">
        {children}
      </main>
      <LandingFooter className="absolute top-0 w-full" />
    </div>
  );
}
