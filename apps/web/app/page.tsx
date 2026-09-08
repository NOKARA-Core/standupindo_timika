import { Navbar } from "../src/components/Navbar";
import { HeroSection } from "../src/components/HeroSection";
import { ScheduleSection } from "../src/components/ScheduleSection";
import { TalentGridSection } from "../src/components/TalentGridSection";
import { GallerySection } from "../src/components/GallerySection";
import { StoreSection } from "../src/components/StoreSection";
import { PartnersSection } from "../src/components/PartnersSection";
import { LocationSection } from "../src/components/LocationSection";
import { Footer } from "../src/components/Footer";
import { getSiteConfig } from "../src/lib/site-config.server";

export default async function Home() {
  const siteConfig = await getSiteConfig();

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-[#FF4500] selection:text-white">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <HeroSection
          heroConfig={siteConfig.hero}
          isDynamic={siteConfig.useDynamicAssets}
        />
        <ScheduleSection />
        <TalentGridSection
          comediansConfig={siteConfig.comedians}
          isDynamic={siteConfig.useDynamicAssets}
        />
        <GallerySection />
        <StoreSection
          merchConfig={siteConfig.merch}
          isDynamic={siteConfig.useDynamicAssets}
        />
        <PartnersSection />
        <LocationSection />
      </main>
      <Footer />
    </div>
  );
}
