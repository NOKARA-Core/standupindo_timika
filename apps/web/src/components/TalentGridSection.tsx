import Link from "next/link";
import { Users } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

interface Talent {
  name: string;
  badge: string;
  description: string;
}

const talentList: Talent[] = [
  {
    name: "DIMAS",
    badge: "DEADPAN",
    description:
      "Master of awkward silences and brutal observations about Timika traffic.",
  },
  {
    name: "TIKA",
    badge: "OBSERVATIONAL",
    description:
      "Rapid-fire punchlines dissecting modern relationships and local cafe culture.",
  },
  {
    name: "RIAN",
    badge: "ROAST",
    description:
      "No one is safe. If you sit in the front row, you're part of the set.",
  },
];

export function TalentGridSection() {
  return (
    <section
      id="talents"
      className="w-full bg-[#FDFBF7] py-16 px-6 md:px-12 lg:px-20 border-b-2 border-black overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
        {/* Section Heading with slide-left reveal */}
        <ScrollReveal variant="slide-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                <Users className="w-6 h-6 text-[#FF4500]" />
              </div>
              <h2 className="font-['Anton',sans-serif] text-3xl md:text-5xl text-[#281812] uppercase tracking-wide">
                THE LINEUP
              </h2>
            </div>

            <Link
              href="/talents"
              className="hidden md:inline-block font-['Space_Mono',monospace] text-sm font-bold text-[#FF4500] hover:text-black underline decoration-2 uppercase"
            >
              VIEW ALL ROSTER →
            </Link>
          </div>
        </ScrollReveal>

        {/* Talent Grid with Staggered pop-in */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {talentList.map((talent, index) => (
            <ScrollReveal key={index} variant="pop-up" delayMs={index * 100}>
              <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000000] flex flex-col justify-between hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 transition-all">
                {/* Card Header Frame */}
                <div className="h-52 bg-[#FFF8F6] border-b-2 border-black p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-black text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-wider">
                      {talent.badge}
                    </span>
                    <span className="font-['Space_Mono',monospace] text-xs font-bold text-[#5C4037]">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="text-center py-4">
                    <span className="font-['Anton',sans-serif] text-5xl text-[#281812] tracking-wider uppercase opacity-20 select-none">
                      COMEDIAN
                    </span>
                  </div>

                  <div className="w-full h-1 bg-black"></div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col justify-between flex-1 gap-6">
                  <div>
                    <h3 className="font-['Anton',sans-serif] text-3xl text-[#281812] uppercase tracking-wide">
                      {talent.name}
                    </h3>
                    <p className="font-['Work_Sans',sans-serif] text-base text-[#5C4037] mt-3 leading-relaxed">
                      {talent.description}
                    </p>
                  </div>

                  <Link
                    href="/talents"
                    className="w-full py-3 bg-[#FFF8F6] hover:bg-black hover:text-white text-[#281812] font-['Space_Mono',monospace] text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all text-center block"
                  >
                    BOOK NOW
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
