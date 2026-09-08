import { MapPin } from "lucide-react";

export function LocationSection() {
  return (
    <section
      id="about"
      className="w-full bg-[#FFE9E3] py-16 px-6 md:px-12 lg:px-20 border-b-2 border-black"
    >
      <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
        {/* Section Heading */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <MapPin className="w-6 h-6 text-[#FFE9E3]" />
          </div>
          <h2 className="font-['Anton',sans-serif] text-3xl md:text-5xl text-[#281812] uppercase tracking-wide">
            LOCATION
          </h2>
        </div>

        {/* Map Frame with Location Badge */}
        <div className="w-full h-[400px] bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000000] relative overflow-hidden flex items-end p-6 md:p-8">
          {/* Map Graphic Simulation Background */}
          <div className="absolute inset-0 bg-[#f4ebe6] flex items-center justify-center">
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0d5cf_1px,transparent_1px),linear-gradient(to_bottom,#e0d5cf_1px,transparent_1px)] bg-[size:40px_40px]" />
            {/* Compass / Roads abstract shapes */}
            <div className="w-96 h-96 rounded-none border-4 border-black/10 rotate-12 flex items-center justify-center">
              <span className="font-['Anton',sans-serif] text-8xl text-black/5 select-none uppercase">
                TIMIKA
              </span>
            </div>
          </div>

          {/* Location Info Box */}
          <div className="relative z-10 bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#000000] max-w-[360px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-[#FF4500] border border-black inline-block animate-pulse"></span>
              <span className="font-['Space_Mono',monospace] text-[10px] font-bold text-[#A83300] uppercase tracking-widest">
                BASECAMP
              </span>
            </div>
            <h3 className="font-['Anton',sans-serif] text-2xl md:text-3xl text-black uppercase tracking-wide">
              STANDUP INDO TIMIKA HQ
            </h3>
            <p className="font-['Work_Sans',sans-serif] text-sm md:text-base text-black mt-2 font-medium">
              Jl. Budi Utomo No. 12, Timika, Papua
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
