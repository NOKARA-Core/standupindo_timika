import { MapPin, ExternalLink, Navigation } from "lucide-react";
import { AnimateReveal } from "./AnimateReveal";

export function LocationSection() {
  const gmapsUrl =
    "https://www.google.com/maps/search/?api=1&query=SKY+COFFEE25+TIMIKA+PAPUA+Jl.+Bhayangkara+Koperapoka";
  const embedUrl =
    "https://maps.google.com/maps?q=SKY%20COFFEE25%20TIMIKA%20PAPUA&t=&z=16&ie=UTF8&iwloc=&output=embed";

  return (
    <section
      id="location"
      className="w-full bg-[#FFE9E3] py-16 px-6 md:px-12 lg:px-20 border-b-2 border-black overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto flex flex-col gap-10">
        {/* Section Heading */}
        <AnimateReveal variant="slide-left" durationMs={650}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              <MapPin className="w-6 h-6 text-[#FFE9E3]" />
            </div>
            <h2 className="font-['Anton',sans-serif] text-3xl md:text-5xl text-[#281812] uppercase tracking-wide">
              LOCATION & BASECAMP
            </h2>
          </div>
        </AnimateReveal>

        {/* 2-Column Responsive Split Layout (Stack on mobile, 2-cols on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Detail Info Card */}
          <div className="lg:col-span-5 flex">
            <AnimateReveal variant="fade-up" durationMs={650} className="w-full flex">
              <div className="w-full bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000000] flex flex-col justify-between gap-6">
                <div className="flex flex-col gap-4">
                  {/* Badge */}
                  <div>
                    <span className="bg-[#FF4500] text-white font-['Space_Mono',monospace] px-3 py-1 uppercase text-xs font-bold border-2 border-black inline-block shadow-[2px_2px_0px_0px_#000000]">
                      OFFICIAL BASECAMP / HQ
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-['Anton',sans-serif] text-3xl md:text-4xl text-[#281812] uppercase tracking-wide">
                    SKY COFFEE25
                  </h3>

                  {/* Full Address */}
                  <div className="flex flex-col gap-2 font-['Work_Sans',sans-serif] text-sm md:text-base text-[#5C4037] leading-relaxed border-l-4 border-black pl-4">
                    <p className="font-semibold text-[#281812]">
                      CVXR+XM5, Jl. Bhayangkara, Koperapoka
                    </p>
                    <p>
                      Kec. Mimika Baru, Kabupaten Mimika, Papua Tengah 99971
                    </p>
                    <p className="text-xs font-['Space_Mono',monospace] text-[#A83300] font-bold mt-1">
                      PLUS CODE: CVXR+XM5 Koperapoka, Mimika
                    </p>
                  </div>

                  <p className="font-['Work_Sans',sans-serif] text-xs text-[#5C4037] mt-1 italic">
                    Patokan: Kawasan Jl. Bhayangkara Koperapoka, tempat kumpul komika StandUp INDO Timika, workshop open mic, dan bedah materi mingguan.
                  </p>
                </div>

                {/* CTA Action Button */}
                <div className="pt-4 border-t-2 border-black">
                  <a
                    href={gmapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full bg-black hover:bg-[#FF4500] text-[#ffffff] hover:text-[#000000] font-['Space_Mono',monospace] px-4 py-3.5 uppercase tracking-wider font-bold border-2 border-black shadow-[4px_4px_0px_0px_#FF4500] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="text-[#ffffff] group-hover:text-[#000000] transition-colors">
                      OPEN IN GOOGLE MAPS
                    </span>
                    <ExternalLink className="w-4 h-4 text-[#ffffff] group-hover:text-[#000000] transition-colors" />
                  </a>
                </div>
              </div>
            </AnimateReveal>
          </div>

          {/* Right Column: Google Maps Embed Iframe */}
          <div className="lg:col-span-7 flex">
            <AnimateReveal variant="fade-up" delayMs={100} durationMs={700} className="w-full flex">
              <div className="w-full h-[380px] md:h-[460px] lg:h-full min-h-[380px] bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000000] relative overflow-hidden group">
                <iframe
                  title="Peta Lokasi SKY COFFEE25 TIMIKA"
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full rounded-none filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-300"
                />

                {/* Neo-brutalism corner tag on the map */}
                <div className="absolute top-4 left-4 pointer-events-none">
                  <div className="bg-white border-2 border-black px-3 py-1 text-xs font-['Space_Mono',monospace] font-bold text-black shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#FF4500]" />
                    <span>TIMIKA PAPUA </span>
                  </div>
                </div>
              </div>
            </AnimateReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
