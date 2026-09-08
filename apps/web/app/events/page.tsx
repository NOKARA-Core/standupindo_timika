"use client";

import { useState } from "react";
import { Navbar } from "../../src/components/Navbar";
import { Footer } from "../../src/components/Footer";
import { AnimateReveal } from "../../src/components/AnimateReveal";
import { Calendar, Clock, MapPin, User, ExternalLink } from "lucide-react";

interface EventItem {
  id: string;
  type: "OPEN MIC" | "SPECIAL SHOWS";
  title: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  host: string;
  price: string;
  taptapUrl: string;
  status: "REGISTRATION OPEN" | "TICKETS AVAILABLE" | "LIMITED SEATS";
}

const eventsData: EventItem[] = [
  {
    id: "grind-01",
    type: "OPEN MIC",
    title: "THE GRIND VOL. 42",
    date: "FRI, OCT 13, 2026",
    time: "20:00 WIT",
    venue: "THE BUNKER",
    address: "Jl. Yos Sudarso No. 18, Timika",
    host: "RIAN 'THE HAMMER'",
    price: "FREE ENTRY / F&B",
    taptapUrl: "https://taptap.id/e/stup-timika-grind-42",
    status: "REGISTRATION OPEN",
  },
  {
    id: "grind-02",
    type: "OPEN MIC",
    title: "THE GRIND: NEWBLOOD EDITION",
    date: "SAT, OCT 14, 2026",
    time: "21:00 WIT",
    venue: "NEON CAFE",
    address: "SP2 Jalur 3, Timika",
    host: "TIKA 'NO FILTER'",
    price: "FREE ENTRY",
    taptapUrl: "https://taptap.id/e/stup-timika-newblood",
    status: "REGISTRATION OPEN",
  },
  {
    id: "grind-03",
    type: "OPEN MIC",
    title: "ACOUSTIC & COMEDY NIGHT",
    date: "WED, OCT 18, 2026",
    time: "19:30 WIT",
    venue: "KOPI & TAWA",
    address: "Jl. Timika Indah No. 4, Timika",
    host: "DIMAS",
    price: "FREE ENTRY",
    taptapUrl: "https://taptap.id/e/stup-timika-kopi-tawa",
    status: "REGISTRATION OPEN",
  },
  {
    id: "special-01",
    type: "SPECIAL SHOWS",
    title: "RIAN: 'ROASTING TIMIKA'",
    date: "SAT, NOV 04, 2026",
    time: "19:00 WIT",
    venue: "GEDUNG EME NEME YAUWARE",
    address: "Jl. Budi Utomo, Timika",
    host: "DIMAS & TIKA",
    price: "RP 75.000 (EARLY BIRD)",
    taptapUrl: "https://taptap.id/e/rian-roasting-timika",
    status: "TICKETS AVAILABLE",
  },
  {
    id: "special-02",
    type: "SPECIAL SHOWS",
    title: "STANDUP FEST MIMIKA 2026",
    date: "SAT, DEC 12, 2026",
    time: "18:30 WIT",
    venue: "BALLROOM HOTEL HORISON TIMIKA",
    address: "Jl. Hasanuddin No. 9, Timika",
    host: "ALL TIMIKA ROSTER + NATIONAL GUEST",
    price: "RP 120.000",
    taptapUrl: "https://taptap.id/e/standup-fest-mimika",
    status: "LIMITED SEATS",
  },
];

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "OPEN MIC" | "SPECIAL SHOWS">("ALL");

  const filteredEvents = eventsData.filter((evt) => {
    if (activeTab === "ALL") return true;
    return evt.type === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-[#FF4500] selection:text-white">
      <Navbar />

      <main className="flex-1 py-16 px-6 md:px-12 lg:px-20 max-w-[1280px] mx-auto w-full">
        {/* Header Section */}
        <AnimateReveal variant="slide-left" durationMs={650}>
          <div className="border-b-4 border-black pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-block px-3 py-1 bg-black text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-widest mb-3">
                LIVE SESSIONS
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

        {/* Events Schedule List with Sequential Slide-in from below */}
        <div className="flex flex-col gap-6">
          {filteredEvents.map((event, index) => (
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
                        event.type === "OPEN MIC"
                          ? "bg-[#FFE9E3] text-[#A83300]"
                          : "bg-[#FF4500] text-white"
                      }`}
                    >
                      {event.type}
                    </span>
                    <span className="font-['Space_Mono',monospace] text-[11px] text-[#5C4037] font-semibold">
                      {event.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-['Space_Mono',monospace] text-sm md:text-base font-bold text-[#281812] mt-1">
                    <Calendar className="w-4 h-4 text-[#FF4500]" />
                    <span>{event.date}</span>
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
                      <span className="text-xs font-normal text-[#5C4037]">({event.address})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#281812]" />
                      <span>HOST: <strong>{event.host}</strong></span>
                    </div>
                  </div>

                  <div className="mt-1">
                    <span className="font-['Space_Mono',monospace] text-xs font-bold text-[#A83300] bg-[#FFE9E3] px-2 py-0.5 border border-black/30">
                      TARIF: {event.price}
                    </span>
                  </div>
                </div>

                {/* Right Action Button: TapTap Link */}
                <div className="lg:w-48 flex items-center justify-start lg:justify-end">
                  <a
                    href={event.taptapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full lg:w-auto px-6 py-3.5 bg-black hover:bg-[#FF4500] text-white font-['Space_Mono',monospace] text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] flex items-center justify-center gap-2 transition-all"
                  >
                    <span>{event.type === "OPEN MIC" ? "RSVP SLOT" : "GET TICKETS"}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </article>
            </AnimateReveal>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
