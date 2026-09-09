import Link from "next/link";
import { Calendar } from "lucide-react";
import { AnimateReveal } from "./AnimateReveal";
import { defaultWebEvents } from "../lib/site-config.server";
import type { DBEvent } from "../lib/types";
import { sanitizeOutboundUrl } from "../lib/security";
import {
  isValidTapTapLink,
  formatEventDate,
  getEventDisplayStatus,
} from "../lib/events-utils";

interface ScheduleSectionProps {
  events?: DBEvent[];
}

export function ScheduleSection({ events }: ScheduleSectionProps) {
  // Use provided events or fallback to defaults
  const allEvents = events && events.length > 0 ? events : defaultWebEvents;

  // Filter for Open Mic / Grind events
  const openMicEvents = allEvents
    .filter((e) => {
      const typeUpper = (e.type || "").toUpperCase();
      const titleUpper = (e.title || "").toUpperCase();
      return (
        typeUpper.includes("OPEN") ||
        titleUpper.includes("OPEN MIC") ||
        titleUpper.includes("GRIND")
      );
    })
    .slice(0, 3);

  // If no open mic events found, show top 3 of all events
  const displayList = openMicEvents.length > 0 ? openMicEvents : allEvents.slice(0, 3);

  return (
    <section
      id="schedule"
      className="w-full bg-[#FFE9E3] py-16 px-6 md:px-12 lg:px-20 border-b-2 border-black overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
        {/* Section Heading with slide-left spring reveal */}
        <AnimateReveal variant="slide-left" durationMs={650}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                <Calendar className="w-6 h-6 text-[#FFE9E3]" />
              </div>
              <h2 className="font-['Anton',sans-serif] text-3xl md:text-5xl text-[#281812] uppercase tracking-wide">
                THE GRIND (OPEN MIC)
              </h2>
            </div>

            <Link
              href="/events"
              className="font-['Space_Mono',monospace] text-xs md:text-sm font-bold text-[#FF4500] hover:underline uppercase tracking-wider hidden sm:block"
            >
              VIEW FULL SCHEDULE &rarr;
            </Link>
          </div>
        </AnimateReveal>

        {/* Schedule List Cards */}
        <div className="flex flex-col gap-4">
          {displayList.map((item, idx) => {
            const formattedDate = formatEventDate(item.date);
            const details = `${item.time} • ${item.price || "FREE ENTRY"}`;
            const displayStatus = getEventDisplayStatus(
              item.status,
              item.date,
              item.time,
              item.taptapUrl
            );

            const safeTapTapUrl = sanitizeOutboundUrl(item.taptapUrl);

            return (
              <AnimateReveal
                key={item.id}
                variant="fade-up"
                delayMs={idx * 80}
                durationMs={600}
              >
                <div className="w-full bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000000] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-[3px_3px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 transition-all">
                  {/* Date & Badge */}
                  <div className="flex items-center gap-3">
                    <span className="font-['Space_Mono',monospace] font-bold text-sm md:text-base text-[#FF4500] bg-[#FFE9E3] px-3 py-1 border border-black/20">
                      {formattedDate}
                    </span>
                  </div>

                  {/* Venue & Details */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-['Anton',sans-serif] text-2xl md:text-[32px] leading-tight text-[#281812] uppercase tracking-wide">
                      {item.title}
                    </h3>
                    <p className="font-['Work_Sans',sans-serif] text-sm md:text-base text-[#5C4037] mt-1">
                      <strong>{item.venue}</strong> • {details}
                    </p>
                  </div>

                  {/* Action Button: TapTap Link OR Comic Coming Soon OR Closed/Selesai */}
                  <div>
                    {displayStatus === "CLOSED" || displayStatus === "EXPIRED" ? (
                      <div
                        className="inline-flex items-center justify-center px-4 py-2 bg-gray-300 text-gray-700 font-['Space_Mono',monospace] text-xs md:text-sm font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] rotate-[-2deg] select-none cursor-not-allowed"
                        title="Acara ini telah selesai atau ditutup"
                      >
                        EVENT SELESAI
                      </div>
                    ) : displayStatus === "ACTIVE_WITH_TICKET" && safeTapTapUrl ? (
                      <a
                        href={safeTapTapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group px-6 py-2.5 bg-black hover:bg-[#FF4500] text-[#ffffff] hover:text-black font-['Space_Mono',monospace] text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="text-[#ffffff] group-hover:text-black transition-colors">
                          RSVP SLOT
                        </span>
                      </a>
                    ) : (
                      <div
                        className="inline-flex items-center justify-center px-4 py-2 bg-[#DC2626] text-white font-['Space_Mono',monospace] text-xs md:text-sm font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] rotate-[-2deg] select-none cursor-not-allowed"
                        title="Tiket / RSVP belum tersedia"
                      >
                        COMING SOON
                      </div>
                    )}
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
