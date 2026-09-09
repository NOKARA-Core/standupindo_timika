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
  isDynamic = false,
}: PartnersSectionProps) {
  // Jika dinamis aktif dan ada data partner dari database, gunakan data dinamis
  const displayItems =
    isDynamic && partners && partners.length > 0
      ? partners
      : defaultSponsors.map((s, idx) => ({
          id: `static-${idx}`,
          name: s.name,
          category: s.category,
          logoUrl: s.logoUrl,
          websiteUrl: s.websiteUrl,
        }));

  // Gandakan set partner agar 50% track lebar dan looping berjalan mulus tanpa celah kosong
  const repeatCount = Math.max(1, Math.ceil(8 / (displayItems.length || 1)));
  const singleSet = Array(repeatCount).fill(displayItems).flat();
  const marqueeItems = [...singleSet, ...singleSet];

  return (
    <section className="w-full bg-[#FDFBF7] py-16 border-b-2 border-black overflow-hidden select-none">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 mb-8">
        {/* Section Heading */}
        <AnimateReveal variant="slide-left" durationMs={650}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              <Handshake className="w-6 h-6 text-[#FF4500]" />
            </div>
            <h2 className="font-['Anton',sans-serif] text-3xl md:text-5xl text-[#281812] uppercase tracking-wide">
              PARTNERS & SPONSORS
            </h2>
          </div>
        </AnimateReveal>
      </div>

      {/* Marquee Track Container with Edge Masking */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Edge Masking / Vignette Neo-Brutalist */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FDFBF7] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FDFBF7] to-transparent z-10" />

        {/* Marquee Track Hardware-Accelerated */}
        <div className="animate-marquee-infinite flex items-center gap-6 will-change-transform translate-z-0">
          {marqueeItems.map((partner, index) => {
            const cardContent = (
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] rounded-none px-8 py-4 h-24 min-w-[200px] flex items-center justify-center transition-all duration-150 group cursor-pointer hover:grayscale-0 hover:opacity-100 hover:-rotate-2 hover:scale-105 hover:shadow-[6px_6px_0px_0px_#FF4500]">
                {partner.logoUrl ? (
                  <div className="relative w-36 h-12 flex items-center justify-center">
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      fill
                      unoptimized
                      className="object-contain grayscale contrast-125 opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-150"
                    />
                  </div>
                ) : (
                  <span className="font-['Anton',sans-serif] text-xl text-[#281812] uppercase tracking-wider block whitespace-nowrap grayscale contrast-125 opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-150">
                    {partner.name}
                  </span>
                )}
              </div>
            );

            return partner.websiteUrl ? (
              <a
                key={`${partner.id || partner.name}-${index}`}
                href={partner.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 block focus:outline-none"
              >
                {cardContent}
              </a>
            ) : (
              <div
                key={`${partner.id || partner.name}-${index}`}
                className="shrink-0"
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
