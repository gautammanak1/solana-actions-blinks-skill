import { ActionBlink } from "@/components/ActionBlink";
import { DevnetBanner } from "@/components/DevnetBanner";
import { DeveloperSection } from "@/components/sections/DeveloperSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <HeroSection />

        <section className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6">
          <DevnetBanner />
          <ActionBlink />
        </section>

        <HowItWorksSection />
        <DeveloperSection />
      </main>

      <SiteFooter />
    </div>
  );
}
