"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, User, ExternalLink } from "lucide-react";
import { AnimateReveal } from "./AnimateReveal";
import { DBEvent } from "../lib/site-config.server";
import { isValidTapTapLink, formatEventDate } from "../lib/events-utils";

interface EventsCatalogClientProps {
  events: DBEvent[];
}

export function EventsCatalogClient({ events }: EventsCatalogClientProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "OPEN MIC" | "SPECIAL SHOWS">("ALL");

  const filteredEvents = events.filter((evt) => {
    if (activeTab === "ALL") return true;
    const typeUpper = (evt.type || "").toUpperCase();
    const titleUpper = (evt.title || "").toUpperCase();
    const isOpenMic =
      typeUpper.includes("OPEN") ||
      titleUpper.includes("OPEN MIC") ||
      titleUpper.includes("GRIND");

    if (activeTab === "OPEN MIC") {
      return isOpenMic;
    } else {
      return !isOpenMic || typeUpper.includes("SPECIAL");
    }
  });

  return (
    <main className="flex-1 py-16 px-6 md:px-12 lg:px-20 max-w-[1280px] mx-auto w-full">
      {/* Header Section */}
      <AnimateReveal variant="slide-left" durationMs={650}>
        <div className="border-b-4 border-black pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-block px-3 py-1 bg-black text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-widest mb-3">
              LIVE SESSIONS & TICKETS
            </div>
            <h1 className="font-['Anton',sans-serif] text-5xl md:text-7xl text-[#281812] uppercase tracking-tight">
              THE GRIND & SHOWS
            </h1>
            <p className="font-['Work_Sans',sans-serif] text-lg text-[#5C4037] mt-2 max-w-xl">
              Panggung open mic mingguan hingga pertunjukan spesial tunggal komika StandUp INDO Timika.
            </p>
          </div>

          {/* Tab Toggles Neo-Brutalist */}
          <div className="flex bg-white border-2 border-black p-1 shadow-[4px_4px_0px_0px_#000000]">
            {(["ALL", "OPEN MIC", "SPECIAL SHOWS"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 md:px-6 py-2 font-['Space_Mono',monospace] text-xs md:text-sm font-bold uppercase tracking-wider cursor-pointer active:translate-x-[1px] active:translate-y-[1px] transition-all ${
                  activeTab === tab
                    ? "bg-[#FF4500] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                    : "text-[#281812] hover:bg-[#FFE9E3]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </AnimateReveal>

      {/* Events Schedule List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_#000000]">
          <span className="font-['Anton',sans-serif] text-3xl text-[#281812] uppercase block">
            TIDAK ADA JADWAL SHOW
          </span>
          <p className="font-['Space_Mono',monospace] text-sm text-[#5C4037] mt-2">
            Belum ada jadwal acara aktif untuk kategori ini.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredEvents.map((event, index) => {
            const typeUpper = (event.type || "").toUpperCase();
            const titleUpper = (event.title || "").toUpperCase();
            const isOpenMic =
              typeUpper.includes("OPEN") ||
              titleUpper.includes("OPEN MIC") ||
              titleUpper.includes("GRIND");
            const hasValidLink = isValidTapTapLink(event.taptapUrl);

            return (
              <AnimateReveal
                key={event.id}
                variant="fade-up"
                delayMs={index * 90}
                durationMs={650}
              >
                <article className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_#000000] flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#000000] transition-all">
                  {/* Left Details: Date & Type */}
                  <div className="lg:w-72 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-wider border border-black ${
                          isOpenMic
                            ? "bg-[#FFE9E3] text-[#A83300]"
                            : "bg-[#FF4500] text-white"
                        }`}
                      >
                        {isOpenMic ? "OPEN MIC" : "SPECIAL SHOW"}
                      </span>
                      <span className="font-['Space_Mono',monospace] text-[11px] text-[#5C4037] font-semibold">
                        {event.status || "PUBLISHED"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-['Space_Mono',monospace] text-sm md:text-base font-bold text-[#281812] mt-1">
                      <Calendar className="w-4 h-4 text-[#FF4500]" />
                      <span>{formatEventDate(event.date)}</span>
                    </div>

                    <div className="flex items-center gap-2 font-['Space_Mono',monospace] text-xs text-[#5C4037]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{event.time}</span>
                    </div>
                  </div>

                  {/* Middle Details: Venue & Host */}
                  <div className="flex-1 flex flex-col gap-2">
                    <h2 className="font-['Anton',sans-serif] text-3xl md:text-4xl text-[#281812] uppercase tracking-wide">
                      {event.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm font-['Work_Sans',sans-serif] text-[#5C4037]">
                      <div className="flex items-center gap-1.5 font-semibold text-[#281812]">
                        <MapPin className="w-4 h-4 text-[#FF4500]" />
                        <span>{event.venue}</span>
                        {event.address && (
                          <span className="text-xs font-normal text-[#5C4037]">
                            ({event.address})
                          </span>
                        )}
                      </div>
                      {event.host && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-[#281812]" />
                          <span>
                            HOST: <strong>{event.host}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-1">
                      <span className="font-['Space_Mono',monospace] text-xs font-bold text-[#A83300] bg-[#FFE9E3] px-2 py-0.5 border border-black/30">
                        TARIF: {event.price || "FREE ENTRY"}
                      </span>
                    </div>
                  </div>

                  {/* Right Action: TapTap Link OR Comic-Style Coming Soon Badge */}
                  <div className="lg:w-48 flex items-center justify-start lg:justify-end">
                    {hasValidLink && event.taptapUrl ? (
                      <a
                        href={event.taptapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group w-full lg:w-auto px-6 py-3.5 bg-black hover:bg-[#FF4500] text-[#ffffff] hover:text-[#000000] font-['Space_Mono',monospace] text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <span className="text-[#ffffff] group-hover:text-[#000000] transition-colors">
                          {isOpenMic ? "RSVP SLOT" : "GET TICKETS"}
                        </span>
                        <ExternalLink className="w-4 h-4 text-[#ffffff] group-hover:text-[#000000] transition-colors" />
                      </a>
                    ) : (
                      <div
                        className="inline-flex items-center justify-center px-5 py-3 bg-[#DC2626] text-white font-['Space_Mono',monospace] text-xs md:text-sm font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] rotate-[-2deg] select-none cursor-not-allowed"
                        title="Link pembelian tiket / RSVP belum dibuka"
                      >
                        COMING SOON
                      </div>
                    )}
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
