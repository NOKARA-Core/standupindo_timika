"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, UserCheck, Mic2, MessageCircle } from "lucide-react";
import { AnimateReveal } from "./AnimateReveal";
import { DBComedian } from "../lib/site-config.server";

interface TalentsCatalogClientProps {
  comedians: DBComedian[];
  whatsappNumber: string;
}

export function TalentsCatalogClient({
  comedians,
  whatsappNumber,
}: TalentsCatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("" );

  // Derive unique categories dynamically from comedians, always starting with "All"
  const dynamicCategories = [
    "All",
    ...Array.from(new Set(comedians.map((c) => c.comedyStyle).filter(Boolean))),
  ];

  const filteredComedians = comedians.filter((comedian) => {
    const matchesCategory =
      selectedCategory === "All" ||
      comedian.comedyStyle.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      comedian.stageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comedian.punchline &&
        comedian.punchline.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (comedian.comedyStyle &&
        comedian.comedyStyle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (comedian.bio && comedian.bio.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="flex-1 py-16 px-6 md:px-12 lg:px-20 max-w-[1280px] mx-auto w-full">
      {/* Page Header */}
      <AnimateReveal variant="slide-left" durationMs={650}>
        <div className="border-b-4 border-black pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-block px-3 py-1 bg-black text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-widest mb-3">
              ROSTER TIMIKA
            </div>
            <h1 className="font-['Anton',sans-serif] text-5xl md:text-7xl text-[#281812] uppercase tracking-tight">
              THE LINEUP
            </h1>
            <p className="font-['Work_Sans',sans-serif] text-lg text-[#5C4037] mt-2 max-w-xl">
              Komika underground Timika siap mengguncang panggung dengan set materi tanpa sensor dan punchline tajam.
            </p>
          </div>

          <div className="flex items-center gap-2 font-['Space_Mono',monospace] text-sm font-bold bg-white border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_#000000]">
            <UserCheck className="w-5 h-5 text-[#FF4500]" />
            <span>{filteredComedians.length} ROSTER READY</span>
          </div>
        </div>
      </AnimateReveal>

      {/* Filter Bar & Search Input */}
      <AnimateReveal variant="fade-up" delayMs={100} durationMs={650}>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 mb-12">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {dynamicCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 font-['Space_Mono',monospace] text-xs md:text-sm font-bold uppercase tracking-wider border-2 border-black cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all ${
                  selectedCategory === cat
                    ? "bg-[#FF4500] text-white shadow-[4px_4px_0px_0px_#000000]"
                    : "bg-white text-[#281812] shadow-[4px_4px_0px_0px_#000000] hover:bg-[#FFE9E3]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <input
              type="text"
              placeholder="SEARCH TALENT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-black px-4 py-2.5 pl-10 font-['Space_Mono',monospace] text-sm text-[#281812] placeholder-[#5C4037] rounded-none focus:outline-none focus:ring-2 focus:ring-[#FF4500] shadow-[4px_4px_0px_0px_#000000]"
            />
            <Search className="w-4 h-4 text-[#281812] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </AnimateReveal>

      {/* Talent Grid */}
      {filteredComedians.length === 0 ? (
        <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_#000000]">
          <span className="font-['Anton',sans-serif] text-3xl text-[#281812] uppercase block">
            NO TALENT FOUND
          </span>
          <p className="font-['Space_Mono',monospace] text-sm text-[#5C4037] mt-2">
            Coba cari dengan kata kunci lain atau reset filter kategori.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredComedians.map((comedian, index) => {
            const hasCustomPhoto = Boolean(comedian.avatarUrl?.trim());
            const bookingTargetPhone = comedian.phone?.replace(/\D/g, "") || whatsappNumber;
            const bookingMsg = `Halo StandUP INDO Timika, saya ingin mengundang / booking komika: ${comedian.stageName} untuk panggung acara. Mohon info ketersediaan jadwal.`;
            const bookingUrl = `https://wa.me/${bookingTargetPhone}?text=${encodeURIComponent(bookingMsg)}`;

            return (
              <AnimateReveal
                key={comedian.id}
                variant="fade-up"
                delayMs={index * 75}
                durationMs={650}
              >
                <article className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-full">
                  {/* Visual Card Header */}
                  <div className="h-64 bg-[#281812] border-b-2 border-black p-4 flex flex-col justify-between relative overflow-hidden">
                    {/* Headshot Image Layer */}
                    {hasCustomPhoto && comedian.avatarUrl && (
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={comedian.avatarUrl}
                          alt={comedian.stageName}
                          fill
                          className="object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />
                      </div>
                    )}

                    {!hasCustomPhoto && (
                      <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:20px_20px]" />
                    )}

                    <div className="relative z-10 flex justify-between items-start">
                      <span className="px-3 py-1 font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-wider border border-black bg-black text-white">
                        {comedian.comedyStyle}
                      </span>
                      <span className="font-['Space_Mono',monospace] text-xs font-bold text-white bg-black/70 px-2 py-0.5 border border-white/20">
                        {comedian.totalOpenMic} SHOWS
                      </span>
                    </div>

                    {!hasCustomPhoto && (
                      <div className="relative z-10 text-center my-auto">
                        <span className="font-['Anton',sans-serif] text-6xl text-white tracking-widest uppercase opacity-30 select-none block">
                          STANDUP
                        </span>
                        <span className="font-['Anton',sans-serif] text-3xl text-white tracking-wider uppercase block mt-[-10px]">
                          {comedian.stageName}
                        </span>
                      </div>
                    )}

                    <div className="relative z-10 flex justify-between items-center font-['Space_Mono',monospace] text-[10px] text-white/80 uppercase">
                      <span>TIMIKA CHAPTER</span>
                      <span>ACTIVE ROSTER</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col justify-between flex-1 gap-6">
                    <div>
                      <h2 className="font-['Anton',sans-serif] text-3xl text-[#281812] uppercase tracking-wide">
                        {comedian.stageName}
                      </h2>
                      {comedian.punchline && (
                        <p className="font-['Work_Sans',sans-serif] font-medium text-sm text-[#281812] mt-1 italic border-l-2 border-[#FF4500] pl-2">
                          &quot;{comedian.punchline}&quot;
                        </p>
                      )}
                      <p className="font-['Work_Sans',sans-serif] text-sm text-[#5C4037] mt-3 leading-relaxed">
                        {comedian.bio}
                      </p>
                    </div>

                    <a
                      href={bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group w-full py-3 bg-[#FF4500] hover:bg-[#281812] text-white hover:text-white font-['Space_Mono',monospace] text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-white group-hover:text-white transition-colors" />
                      <span className="text-white group-hover:text-white transition-colors">
                        BOOK / CONTACT
                      </span>
                    </a>
                  </div>
                </article>
              </AnimateReveal>
            );
          })}
        </div>
      )}
    </main>
  );
}
