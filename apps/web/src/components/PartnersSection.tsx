import Image from "next/image";
import { Handshake } from "lucide-react";
import { AnimateReveal } from "./AnimateReveal";
import { WebPartnerItem } from "../lib/site-config";

interface StaticSponsor {
  name: string;
  category: string;
  websiteUrl?: string;
  logoUrl?: string;
}

const defaultSponsors: StaticSponsor[] = [
  { name: "KOPITIAM 88", category: "OFFICIAL COFFEE" },
  { name: "TIMIKA BEATZ", category: "AUDIO PARTNER" },
  { name: "UNDERGROUND PRINT", category: "MERCHANDISE" },
  { name: "MIMIKA CREATIVE", category: "MEDIA PARTNER" },
];

interface PartnersSectionProps {
  partners?: WebPartnerItem[];
  isDynamic?: boolean;
}

export function PartnersSection({
  partners,
}: PartnersSectionProps) {
  // Direct-first: Gunakan partner dinamis dari database jika tersedia, atau otomatis fallback ke default sponsors
  const displayItems =
    partners && partners.length > 0
      ? partners
      : defaultSponsors.map((s, idx) => ({
          id: `static-${idx}`,
          name: s.name,
          category: s.category,
          logoUrl: s.logoUrl,
          websiteUrl: s.websiteUrl,
        }));

  return (
    <section className="w-full bg-[#FDFBF7] py-12 md:py-16 border-b-2 border-black overflow-hidden select-none">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 mb-8">
        {/* Section Heading */}
        <AnimateReveal variant="slide-left" durationMs={650}>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-black text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              <Handshake className="w-5 h-5 md:w-6 md:h-6 text-[#FF4500]" />
            </div>
            <h2 className="font-['Anton',sans-serif] text-2xl sm:text-3xl md:text-5xl text-[#281812] uppercase tracking-wide">
              PARTNERS & SPONSORS
            </h2>
          </div>
        </AnimateReveal>
      </div>

      {/* Auto-Scale Multi-Column Grid (Mobile: 2-3 kolom, Desktop: auto-fit full row lebar seksi) */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3 md:gap-6 w-full">
          {displayItems.map((partner, index) => {
            const cardInner = (
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] rounded-none p-3 md:p-5 flex flex-col items-center justify-between animate-brutal-tick hover:rotate-2 hover:scale-105 hover:bg-[#FF4500]/10 hover:shadow-[6px_6px_0px_0px_#000] transition-transform duration-75 ease-out cursor-pointer h-full min-h-[120px] md:min-h-[140px] w-full">
                {/* Area Logo Fixed */}
                <div className="h-14 md:h-20 w-full flex items-center justify-center relative">
                  {partner.logoUrl ? (
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      fill
                      unoptimized
                      className="object-contain max-h-full max-w-full"
                    />
                  ) : (
                    <span className="font-['Anton',sans-serif] text-base md:text-lg text-[#281812] uppercase tracking-wider text-center line-clamp-2">
                      {partner.name}
                    </span>
                  )}
                </div>

                {/* Label Nama Brand */}
                <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider text-black border-t-2 border-black w-full text-center pt-1.5 mt-2.5 line-clamp-1">
                  {partner.name}
                </span>
              </div>
            );

            return partner.websiteUrl ? (
              <a
                key={partner.id || `${partner.name}-${index}`}
                href={partner.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block focus:outline-none w-full h-full"
                title={`Kunjungi ${partner.name}`}
              >
                {cardInner}
              </a>
            ) : (
              <div
                key={partner.id || `${partner.name}-${index}`}
                className="w-full h-full"
              >
                {cardInner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
