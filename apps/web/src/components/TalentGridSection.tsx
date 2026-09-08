import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import { AnimateReveal } from "./AnimateReveal";
import { ComedianAssetConfig, defaultSiteConfig } from "../lib/site-config";

interface TalentGridSectionProps {
  comediansConfig?: ComedianAssetConfig[];
  isDynamic?: boolean;
}

export function TalentGridSection({
  comediansConfig = defaultSiteConfig.comedians,
  isDynamic = false,
}: TalentGridSectionProps) {
  return (
    <section
      id="talents"
      className="w-full bg-[#FDFBF7] py-16 px-6 md:px-12 lg:px-20 border-b-2 border-black overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
        {/* Section Heading with slide-left reveal */}
        <AnimateReveal variant="slide-left" durationMs={650}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                <Users className="w-6 h-6 text-[#FF4500]" />
              </div>
              <h2 className="font-['Anton',sans-serif] text-3xl md:text-5xl text-[#281812] uppercase tracking-wide">
                THE LINEUP
              </h2>
            </div>

            <Link
              href="/talents"
              className="hidden md:inline-block font-['Space_Mono',monospace] text-sm font-bold text-[#FF4500] hover:text-black underline decoration-2 uppercase"
            >
              VIEW ALL ROSTER →
            </Link>
          </div>
        </AnimateReveal>

        {/* Talent Grid with Staggered pop-in */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {comediansConfig.map((talent, index) => {
            const hasCustomPhoto = Boolean(isDynamic && talent.avatarUrl);

            return (
              <AnimateReveal
                key={talent.id || index}
                variant="fade-up"
                delayMs={index * 110}
                durationMs={700}
              >
                <div className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_#000000] flex flex-col justify-between hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 transition-all h-full">
                  {/* Card Header Frame (Fixed Aspect/Height Container) */}
                  <div className="h-56 bg-[#FFF8F6] border-b-4 border-black p-4 flex flex-col justify-between relative overflow-hidden">
                    {/* Custom Headshot Image Layer */}
                    {hasCustomPhoto && talent.avatarUrl && (
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={talent.avatarUrl}
                          alt={talent.name}
                          fill
                          className="object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="flex justify-between items-start z-10 relative">
                      <span className="px-3 py-1 bg-black text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-wider border border-white/20">
                        {talent.badge}
                      </span>
                      <span
                        className={`font-['Space_Mono',monospace] text-xs font-bold ${
                          hasCustomPhoto ? "text-white" : "text-[#5C4037]"
                        }`}
                      >
                        0{index + 1}
                      </span>
                    </div>

                    {/* Typographic fallback when no custom photo */}
                    {!hasCustomPhoto && (
                      <div className="text-center py-4 z-10 relative">
                        <span className="font-['Anton',sans-serif] text-5xl text-[#281812] tracking-wider uppercase opacity-20 select-none">
                          COMEDIAN
                        </span>
                      </div>
                    )}

                    <div className="w-full h-1 bg-black z-10 relative"></div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col justify-between flex-1 gap-6">
                    <div>
                      <h3 className="font-['Anton',sans-serif] text-3xl text-[#281812] uppercase tracking-wide">
                        {talent.name}
                      </h3>
                      <p className="font-['Work_Sans',sans-serif] text-base text-[#5C4037] mt-3 leading-relaxed">
                        {talent.description}
                      </p>
                    </div>

                    <Link
                      href="/talents"
                      className="group w-full py-3 bg-[#FFF8F6] hover:bg-black text-[#281812] hover:text-[#ffffff] font-['Space_Mono',monospace] text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all text-center block"
                    >
                      <span className="text-[#281812] group-hover:text-[#ffffff] transition-colors">
                        BOOK NOW
                      </span>
                    </Link>
                  </div>
                </div>
              </AnimateReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
