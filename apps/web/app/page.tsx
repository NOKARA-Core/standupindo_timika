import { Navbar } from "../src/components/Navbar";
import { HeroSection } from "../src/components/HeroSection";
import { ScheduleSection } from "../src/components/ScheduleSection";
import { TalentGridSection } from "../src/components/TalentGridSection";
import { GallerySection } from "../src/components/GallerySection";
import { StoreSection } from "../src/components/StoreSection";
import { PartnersSection } from "../src/components/PartnersSection";
import { LocationSection } from "../src/components/LocationSection";
import { Footer } from "../src/components/Footer";
import { getMediaSettingsFromDB, getPartnersFromDB } from "../src/lib/site-config.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [config, partners] = await Promise.all([
    getMediaSettingsFromDB(),
    getPartnersFromDB(),
  ]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-[#FF4500] selection:text-white relative">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <HeroSection heroConfig={config?.hero} />
        <ScheduleSection />
        <TalentGridSection comediansConfig={config?.comedians} />
        <GallerySection documentationConfig={config?.flyers} />
        <StoreSection merchConfig={config?.merch} />
        <PartnersSection partners={partners} />
        <LocationSection />
      </main>
      <Footer />
    </div>
  );
}
