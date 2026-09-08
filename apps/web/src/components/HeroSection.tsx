import Link from "next/link";
import { Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="w-full bg-[#FDFBF7] py-16 px-6 md:px-12 lg:px-20 border-b-2 border-black">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Headline, Subtitle, CTAs */}
        <div className="flex flex-col gap-6 max-w-[548px]">
          <h1 className="font-['Anton',sans-serif] text-5xl md:text-7xl lg:text-[80px] leading-[1.0] tracking-tight text-[#281812] uppercase">
            LAUGH LOUDER.
            <br />
            LIVE RAW.
          </h1>

          <p className="font-['Work_Sans',sans-serif] text-lg md:text-[20px] leading-relaxed text-[#281812]">
            Standupindo Timika is where the underground meets the punchline.
            Unfiltered comedy straight from the rough edges of reality. No
            apologies, just raw talent.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/events"
              className="px-8 py-3.5 bg-[#FF4500] hover:bg-[#e03d00] text-white font-['Space_Mono',monospace] text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[8px_8px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#000000] transition-all"
            >
              GET TICKETS
            </Link>

            <Link
              href="/events"
              className="px-8 py-3.5 bg-[#FFF8F6] hover:bg-[#ffece6] text-[#281812] font-['Space_Mono',monospace] text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[8px_8px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#000000] flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 fill-current text-[#281812]" />
              <span>OPEN MIC</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Visual Frame */}
        <div className="w-full max-w-[548px] h-[380px] md:h-[480px] lg:h-[500px] mx-auto bg-[#FFF8F6] border-2 border-black shadow-[8px_8px_0px_0px_#000000] relative overflow-hidden flex flex-col justify-between p-6">
          {/* Neo-brutalist graphic card badge */}
          <div className="flex justify-between items-start">
            <span className="px-3 py-1 bg-black text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-widest">
              PAPUA UNDERGROUND
            </span>
            <span className="px-3 py-1 bg-[#FF4500] text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-widest border border-black">
              EST. TIMIKA
            </span>
          </div>

          {/* Central graphic typography badge */}
          <div className="my-auto text-center border-4 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000000]">
            <span className="font-['Anton',sans-serif] text-4xl md:text-5xl lg:text-6xl text-[#281812] uppercase block tracking-wider">
              STANDUPINDO
            </span>
            <span className="font-['Anton',sans-serif] text-3xl md:text-4xl text-[#FF4500] uppercase block tracking-widest mt-1">
              TIMIKA CHAPTER
            </span>
            <p className="font-['Space_Mono',monospace] text-xs uppercase tracking-widest text-[#5C4037] mt-3 border-t-2 border-black pt-2">
              SOLID • SPONTAN • SAKIT PERUT
            </p>
          </div>

          <div className="flex justify-between items-end">
            <span className="font-['Space_Mono',monospace] text-xs font-bold text-[#5C4037]">
              STAGE VOL. 04
            </span>
            <Link
              href="/events"
              className="font-['Space_Mono',monospace] text-xs font-bold text-[#281812] underline decoration-2 hover:text-[#FF4500]"
            >
              VIEW SCHEDULE
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
