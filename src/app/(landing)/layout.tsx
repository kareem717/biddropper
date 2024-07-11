
import { LandingFooter } from "@/components/landing/Footer";
import { LandingHero } from "@/components/landing/Hero";
import { LandingNavBar } from "@/components/landing/NavBar";
import { Button } from "@/components/ui/button";


export default async function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavBar className="w-full h-10 sm:h-16" />
      <main className="flex-1 mt-10 sm:mt-16">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
