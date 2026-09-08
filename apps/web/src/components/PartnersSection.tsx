import { Handshake } from "lucide-react";

interface Sponsor {
  name: string;
  category: string;
}

const sponsors: Sponsor[] = [
  { name: "KOPITIAM 88", category: "OFFICIAL COFFEE" },
  { name: "TIMIKA BEATZ", category: "AUDIO PARTNER" },
  { name: "UNDERGROUND PRINT", category: "MERCHANDISE" },
  { name: "MIMIKA CREATIVE", category: "MEDIA PARTNER" },
];

export function PartnersSection() {
  return (
    <section className="w-full bg-[#FDFBF7] py-16 px-6 md:px-12 lg:px-20 border-b-2 border-black">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
        {/* Section Heading */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <Handshake className="w-6 h-6 text-[#FF4500]" />
          </div>
          <h2 className="font-['Anton',sans-serif] text-3xl md:text-5xl text-[#281812] uppercase tracking-wide">
            PARTNERS & SPONSORS
          </h2>
        </div>

        {/* Sponsor Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {sponsors.map((sponsor, index) => (
            <div
              key={index}
              className="bg-white border-2 border-black p-6 flex flex-col items-center justify-center text-center h-32 shadow-[6px_6px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000000] transition-all"
            >
              <span className="font-['Anton',sans-serif] text-xl md:text-2xl text-[#281812] uppercase tracking-wider block">
                {sponsor.name}
              </span>
              <span className="font-['Space_Mono',monospace] text-[10px] md:text-xs font-bold text-[#5C4037] uppercase tracking-widest mt-1">
                {sponsor.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
