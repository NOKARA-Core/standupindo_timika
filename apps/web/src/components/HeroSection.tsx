import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { HeroAssetConfig, defaultSiteConfig } from "../lib/site-config";

interface HeroSectionProps {
  heroConfig?: HeroAssetConfig;
  dynamicData?: HeroAssetConfig | null;
  isDynamic?: boolean;
}

export function HeroSection({
  heroConfig = defaultSiteConfig.hero,
}: HeroSectionProps) {
  // Direct-first: if custom url exists in database, render image; otherwise fallback to default
  const activeHeroUrl = heroConfig?.url?.trim() || null;
  const hasCustomImage = Boolean(activeHeroUrl);

  return (
    <section className="w-full bg-[#FDFBF7] py-16 px-6 md:px-12 lg:px-20 border-b-2 border-black overflow-hidden">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Headline, Subtitle, CTAs */}
        <div className="flex flex-col gap-6 max-w-[548px]">
          <h1 className="font-['Anton',sans-serif] text-5xl md:text-7xl lg:text-[80px] leading-[1.0] tracking-tight text-[#281812] uppercase">
            LAUGH LOUDER.
            <br />
            LIVE RAW.
          </h1>

          <p className="font-['Work_Sans',sans-serif] text-lg md:text-[20px] leading-relaxed text-[#281812]">
            Standupindo Timika is where the underground meets the punchline.
            Unfiltered comedy straight from the rough edges of reality. No
            apologies, just raw talent.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/events"
              className="px-8 py-3.5 bg-[#FF4500] hover:bg-[#e03d00] text-white font-['Space_Mono',monospace] text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[8px_8px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000000] hover:shadow-[10px_10px_0px_0px_#000000] transition-all"
            >
              GET TICKETS
            </Link>

            <Link
              href="/talents"
              className="px-8 py-3.5 bg-[#FFF8F6] hover:bg-[#ffece6] text-[#281812] font-['Space_Mono',monospace] text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[8px_8px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000000] hover:shadow-[10px_10px_0px_0px_#000000] flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 fill-current text-[#281812]" />
              <span>OPEN MIC</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Visual Frame with Recoil Punch Entrance and Spring Settling */}
        <div
          className="w-full max-w-[548px] h-[380px] md:h-[480px] lg:h-[500px] aspect-[4/5] sm:aspect-square md:aspect-[4/5] mx-auto bg-[#FFF8F6] border-4 border-black rounded-none shadow-[8px_8px_0px_0px_#000000] hover:shadow-[12px_12px_0px_0px_#000000] relative overflow-hidden flex flex-col justify-between p-6 cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] animate-hero-entrance rotate-[1.8deg] hover:rotate-0 hover:scale-[1.01]"
        >
          {/* Dynamic Image Layer (when active) */}
          {hasCustomImage && activeHeroUrl && (
            <div className="absolute inset-0 z-0">
              <Image
                src={activeHeroUrl}
                alt="StandUp INDO Timika Live Stage"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40 pointer-events-none" />
            </div>
          )}

          {/* Top Badges */}
          <div className="flex justify-between items-start z-10 relative">
            <span className="px-3 py-1 bg-black text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-widest border border-white/20">
              {heroConfig?.tag || "PAPUA UNDERGROUND"}
            </span>
            <span className="px-3 py-1 bg-[#FF4500] text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-widest border-2 border-black">
              {heroConfig?.subtag || "EST. TIMIKA"}
            </span>
          </div>

          {/* Central graphic typography badge (Default Fallback) */}
          {!hasCustomImage && (
            <div className="my-auto text-center border-4 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] z-10 relative">
              <span className="font-['Anton',sans-serif] text-4xl md:text-5xl lg:text-6xl text-[#281812] uppercase block tracking-wider">
                {heroConfig?.title || "STANDUPINDO"}
              </span>
              <span className="font-['Anton',sans-serif] text-3xl md:text-4xl text-[#FF4500] uppercase block tracking-widest mt-1">
                {heroConfig?.subtitle || "TIMIKA CHAPTER"}
              </span>
            </div>
          )}

          {/* Bottom Badge Info */}
          <div className="flex justify-between items-end z-10 relative">
            <span
              className={`font-['Space_Mono',monospace] text-xs font-bold ${
                hasCustomImage ? "text-white" : "text-[#5C4037]"
              }`}
            >
              {heroConfig?.badge || "SOLID • SPONTAN • SAKIT PERUT"}
            </span>
            <div className="w-4 h-4 bg-[#FF4500] border border-black" />
          </div>
        </div>
      </div>
    </section>
  );
}
