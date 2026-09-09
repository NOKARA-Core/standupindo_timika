import Image from "next/image";
import { Camera } from "lucide-react";
import { DocumentationAssetConfig } from "../lib/site-config";

interface GalleryItem {
  title: string;
  tag: string;
  category: string;
}

const galleryItems: GalleryItem[] = [
  {
    title: "MAIN EVENT LIVE STAGE",
    tag: "SPECIAL SHOW",
    category: "Main Event Documentation",
  },
  {
    title: "CROWD REACTIONS & LAUGHTER",
    tag: "AUDIENCE",
    category: "Crowd Documentation",
  },
  {
    title: "BACKSTAGE GREEN ROOM VIBES",
    tag: "BEHIND THE SCENE",
    category: "BTS Documentation",
  },
];

interface GallerySectionProps {
  documentationConfig?: DocumentationAssetConfig[];
  isDynamic?: boolean;
}

export function GallerySection({
  documentationConfig,
  isDynamic = false,
}: GallerySectionProps) {
  return (
    <section className="w-full bg-[#FFF8F6] py-16 px-6 md:px-12 lg:px-20 border-b-2 border-black">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
        {/* Section Heading */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <Camera className="w-6 h-6 text-[#FFE9E3]" />
          </div>
          <h2 className="font-['Anton',sans-serif] text-3xl md:text-5xl text-[#281812] uppercase tracking-wide">
            DOKUMENTASI KEGIATAN
          </h2>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {galleryItems.map((item, index) => {
            const dynamicItem = documentationConfig?.[index];
            const activeImageUrl =
              dynamicItem?.imageUrl?.trim() || dynamicItem?.flyerUrl?.trim() || null;
            const displayTitle =
              dynamicItem?.isCustom && dynamicItem?.title
                ? dynamicItem.title
                : item.title;
            const displayTag =
              dynamicItem?.badge?.trim() ? dynamicItem.badge : item.tag;

            return (
              <div
                key={index}
                className="group bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000000] overflow-hidden flex flex-col justify-between h-[360px]"
              >
                {/* Image Frame Placeholder with Graphic Pattern or Uploaded Dynamic Image */}
                <div className="flex-1 bg-[#281812] border-b-2 border-black p-6 flex flex-col justify-between relative overflow-hidden">
                  {activeImageUrl ? (
                    <>
                      <Image
                        src={activeImageUrl}
                        alt={displayTitle}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-[1] pointer-events-none" />
                    </>
                  ) : (
                    <>
                      <div className="z-10 my-auto text-center">
                        <span className="font-['Anton',sans-serif] text-3xl md:text-4xl text-white tracking-widest uppercase block">
                          TIMIKA
                        </span>
                        <span className="font-['Space_Mono',monospace] text-xs text-[#FFE9E3] tracking-wider uppercase block mt-1">
                          STANDUPINDO ARCHIVE
                        </span>
                      </div>

                      <div className="z-10">
                        <span className="font-['Space_Mono',monospace] text-[10px] text-white/50 tracking-widest uppercase">
                          35MM FILM • NO RETOUCH
                        </span>
                      </div>

                      {/* Decorative brutalist background grid lines */}
                      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px]" />
                    </>
                  )}

                  {/* Top Badges always on top */}
                  <div className="flex justify-between items-center z-10 relative">
                    <span className="px-3 py-1 bg-[#FF4500] text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-wider border border-black">
                      {displayTag}
                    </span>
                  </div>
                </div>

                {/* Title Strip */}
                <div className="p-4 bg-white flex items-center justify-between">
                  <span className="font-['Anton',sans-serif] text-lg text-[#281812] uppercase tracking-wide">
                    {displayTitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
