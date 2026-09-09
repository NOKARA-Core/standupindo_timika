import { Navbar } from "../src/components/Navbar";
import { HeroSection } from "../src/components/HeroSection";
import { ScheduleSection } from "../src/components/ScheduleSection";
import { TalentGridSection } from "../src/components/TalentGridSection";
import { GallerySection } from "../src/components/GallerySection";
import { StoreSection } from "../src/components/StoreSection";
import { PartnersSection } from "../src/components/PartnersSection";
import { LocationSection } from "../src/components/LocationSection";
import { Footer } from "../src/components/Footer";
import { getMediaSettingsFromDB } from "../src/lib/site-config.server";
import { PreviewPill } from "../src/components/PreviewPill";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface HomePageProps {
  searchParams: Promise<{ view_mode?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const viewMode = resolvedParams?.view_mode?.toLowerCase();
  const config = await getMediaSettingsFromDB();

  // Prioritaskan query param ?view_mode=dynamic / static jika ada
  const isDynamic =
    viewMode === "dynamic"
      ? true
      : viewMode === "static"
      ? false
      : Boolean(config?.useDynamicAssets);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-[#FF4500] selection:text-white relative">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <HeroSection
          heroConfig={config?.hero}
          dynamicData={isDynamic ? config?.hero : null}
          isDynamic={isDynamic}
        />
        <ScheduleSection />
        <TalentGridSection
          comediansConfig={config?.comedians}
          isDynamic={isDynamic}
        />
        <GallerySection />
        <StoreSection
          merchConfig={config?.merch}
          isDynamic={isDynamic}
        />
        <PartnersSection />
        <LocationSection />
      </main>
      <Footer />

      {/* Floating pill kecil di pojok kiri bawah */}
      <PreviewPill isDynamic={isDynamic} viewMode={viewMode} />
    </div>
  );
}
