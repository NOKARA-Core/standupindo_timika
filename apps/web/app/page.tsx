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
import {
  SiteAssetsConfig,
  defaultSiteConfig,
  getSiteConfig,
} from "../src/lib/site-config";

export default function Home() {
  const [siteConfig, setSiteConfig] = useState<SiteAssetsConfig>(defaultSiteConfig);
  const [forcedMode, setForcedMode] = useState<"static" | "dynamic" | null>(null);

  // Read URL query parameter ?view_mode=static | dynamic (from Admin Panel preview actions)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewMode = params.get("view_mode")?.toLowerCase();
      if (viewMode === "static") {
        setForcedMode("static");
      } else if (viewMode === "dynamic") {
        setForcedMode("dynamic");
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

  // Use forced mode if query param exists, otherwise follow public database setting
  const effectiveIsDynamic =
    forcedMode === "static"
      ? false
      : forcedMode === "dynamic"
      ? true
      : siteConfig.useDynamicAssets;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-[#FF4500] selection:text-white">
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
    </div>
  );
}
