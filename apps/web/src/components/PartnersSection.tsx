"use client";

import Image from "next/image";
import { Handshake, Sparkles } from "lucide-react";
import { AnimateReveal } from "./AnimateReveal";
import { WebPartnerItem, defaultWebPartners } from "../lib/site-config";

interface PartnersSectionProps {
  partners?: WebPartnerItem[];
  isDynamic?: boolean;
}

export function PartnersSection({
  partners = defaultWebPartners,
  isDynamic = false,
}: PartnersSectionProps) {
  const activePartners = partners && partners.length > 0 ? partners : defaultWebPartners;

  // Duplicate items 4 times to ensure seamless infinite looping ticker without gap
  const marqueeItems = [
    ...activePartners,
    ...activePartners,
    ...activePartners,
    ...activePartners,
  ];

  return (
    <section className="w-full bg-[#FDFBF7] py-16 border-b-4 border-black overflow-hidden select-none">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        {/* Section Heading */}
        <AnimateReveal variant="slide-left" durationMs={650}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
              <Handshake className="w-6 h-6 text-[#FF4500]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-widest text-[#A83300]">
                  NETWORK & ECOSYSTEM
                </span>
                {isDynamic && (
                  <span className="px-1.5 py-0.2 bg-emerald-500 text-white font-mono text-[9px] font-bold uppercase">
                    LIVE NEON DB
                  </span>
                )}
              </div>
              <h2 className="font-['Anton',sans-serif] text-3xl md:text-5xl text-[#281812] uppercase tracking-wide">
                PARTNERS & SPONSORS
              </h2>
            </div>
          </div>
        </AnimateReveal>

        {/* Ticker Hint Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#FFE9E3] border-2 border-black shadow-[2px_2px_0px_0px_#000] font-['Space_Mono',monospace] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#FF4500]" />
          <span>COMIC MARQUEE TICKER</span>
        </div>
      </div>

      {/* Marquee Container with Neo-Brutalist Border Tracks */}
      <div className="w-full border-y-4 border-black bg-[#FFF8F6] py-6 relative overflow-hidden">
        <div className="animate-marquee-seamless flex items-center gap-6">
          {marqueeItems.map((partner, index) => {
            const cardContent = (
              <div className="w-64 md:w-72 bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] rounded-none p-5 flex flex-col items-center justify-center text-center group cursor-pointer hover:-rotate-2 hover:scale-105 transition-transform duration-200">
                {/* Transparent Logo Canvas */}
                <div className="w-full h-24 relative flex items-center justify-center">
                  <Image
                    src={partner.logoUrl}
                    alt={partner.name}
                    fill
                    unoptimized
                    className="object-contain p-2 filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-200"
                  />
                </div>

                {/* Footer Brand Info */}
                <div className="mt-3 pt-2.5 border-t-2 border-black w-full flex justify-between items-center">
                  <span className="font-['Anton',sans-serif] text-base text-[#281812] uppercase tracking-wider truncate">
                    {partner.name}
                  </span>
                  <span className="font-['Space_Mono',monospace] text-[9px] font-bold text-[#FF4500] uppercase bg-black text-white px-1.5 py-0.5">
                    OFFICIAL
                  </span>
                </div>
              </div>
            );

            return partner.websiteUrl ? (
              <a
                key={`${partner.id}-${index}`}
                href={partner.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 focus:outline-none"
              >
                {cardContent}
              </a>
            ) : (
              <div key={`${partner.id}-${index}`} className="shrink-0">
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

