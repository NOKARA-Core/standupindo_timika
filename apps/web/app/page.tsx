"use client";

import { useEffect, useState } from "react";
import { Navbar } from "../src/components/Navbar";
import { HeroSection } from "../src/components/HeroSection";
import { ScheduleSection } from "../src/components/ScheduleSection";
import { TalentGridSection } from "../src/components/TalentGridSection";
import { GallerySection } from "../src/components/GallerySection";
import { StoreSection } from "../src/components/StoreSection";
import { PartnersSection } from "../src/components/PartnersSection";
import { LocationSection } from "../src/components/LocationSection";
import { Footer } from "../src/components/Footer";
import { AdminPreviewBar, PreviewMode } from "../src/components/AdminPreviewBar";
import {
  SiteAssetsConfig,
  defaultSiteConfig,
  getSiteConfig,
} from "../src/lib/site-config";

export default function Home() {
  const [siteConfig, setSiteConfig] = useState<SiteAssetsConfig>(defaultSiteConfig);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("auto");

  // Read URL query parameter ?view_mode=static | dynamic
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewMode = params.get("view_mode")?.toLowerCase();
      if (viewMode === "static") {
        setPreviewMode("static");
      } else if (viewMode === "dynamic") {
        setPreviewMode("dynamic");
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    getSiteConfig().then((cfg) => {
      if (isMounted && cfg) {
        setSiteConfig(cfg);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute effective dynamic mode based on public database setting vs preview bar override
  const effectiveIsDynamic =
    previewMode === "auto"
      ? siteConfig.useDynamicAssets
      : previewMode === "dynamic";

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-[#FF4500] selection:text-white relative">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <HeroSection
          heroConfig={siteConfig.hero}
          isDynamic={effectiveIsDynamic}
        />
        <ScheduleSection />
        <TalentGridSection
          comediansConfig={siteConfig.comedians}
          isDynamic={effectiveIsDynamic}
        />
        <GallerySection />
        <StoreSection
          merchConfig={siteConfig.merch}
          isDynamic={effectiveIsDynamic}
        />
        <PartnersSection />
        <LocationSection />
      </main>
      <Footer />

      {/* Floating Admin Preview Bar for live dual mode checking */}
      <AdminPreviewBar
        publicModeIsDynamic={siteConfig.useDynamicAssets}
        activePreviewMode={previewMode}
        onSelectMode={setPreviewMode}
      />
    </div>
  );
}
