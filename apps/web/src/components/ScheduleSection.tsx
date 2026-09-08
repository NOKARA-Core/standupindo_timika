import { Calendar } from "lucide-react";
import { AnimateReveal } from "./AnimateReveal";

interface ScheduleItem {
  date: string;
  venue: string;
  details: string;
}

const scheduleList: ScheduleItem[] = [
  {
    date: "FRI, OCT 13 - 8 PM",
    venue: "THE BUNKER",
    details: "JL. YOS SUDARSO • HOST: RIAN 'THE HAMMER'",
  },
  {
    date: "SAT, OCT 14 - 9 PM",
    venue: "NEON CAFE",
    details: "SP2 • HOST: TIKA 'NO FILTER'",
  },
  {
    date: "WED, OCT 18 - 7 PM",
    venue: "KOPI & TAWA",
    details: "TIMIKA INDAH • HOST: DIMAS",
  },
];

export function ScheduleSection() {
  return (
    <section
      id="schedule"
      className="w-full bg-[#FFE9E3] py-16 px-6 md:px-12 lg:px-20 border-b-2 border-black overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
        {/* Section Heading with slide-left spring reveal */}
        <AnimateReveal variant="slide-left" durationMs={650}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              <Calendar className="w-6 h-6 text-[#FFE9E3]" />
            </div>
            <h2 className="font-['Anton',sans-serif] text-3xl md:text-5xl text-[#281812] uppercase tracking-wide">
              THE GRIND (OPEN MIC)
            </h2>
          </div>
        </AnimateReveal>

        {/* Schedule List with Staggered pop-in */}
        <div className="flex flex-col gap-6">
          {scheduleList.map((item, index) => (
            <AnimateReveal
              key={index}
              variant="fade-up"
              delayMs={index * 90}
              durationMs={700}
            >
              <div className="w-full bg-white border-2 border-black p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[6px_6px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all">
                {/* Date */}
                <div className="md:w-64">
                  <span className="font-['Space_Mono',monospace] text-sm md:text-base font-bold text-[#281812] tracking-wider uppercase block">
                    {item.date}
                  </span>
                </div>

                {/* Venue & Details */}
                <div className="flex-1 flex flex-col">
                  <h3 className="font-['Anton',sans-serif] text-2xl md:text-[32px] leading-tight text-[#281812] uppercase tracking-wide">
                    {item.venue}
                  </h3>
                  <p className="font-['Work_Sans',sans-serif] text-sm md:text-base text-[#5C4037] mt-1">
                    {item.details}
                  </p>
                </div>

                {/* Action Button */}
                <div>
                  <button
                    type="button"
                    className="px-6 py-2 bg-black hover:bg-[#FF4500] text-[#ffffff] hover:text-black font-['Space_Mono',monospace] text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all cursor-pointer"
                  >
                    <span className="text-[#ffffff] hover:text-black">RSVP</span>
                  </button>
                </div>
              </div>
            </AnimateReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
