
import { LandingFooter } from "@/components/landing/Footer";
import { LandingNavBar } from "@/components/landing/NavBar";

export default async function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavBar className="w-full h-12 sm:h-16" />
      <main className="flex-1 mt-10 sm:mt-16">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
