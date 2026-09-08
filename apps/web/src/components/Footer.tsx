import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Globe, Video, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#FDFBF7] border-t-2 border-black">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 py-16">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b-2 border-black">
          {/* Column 1: Brand & Short Bio */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="relative h-10 w-auto flex items-center justify-center border-2 border-black bg-white p-1 shadow-[2px_2px_0px_0px_#000000] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
                <Image
                  src="/logo-stup_timika.png"
                  alt="StandUp INDO Timika"
                  width={140}
                  height={36}
                  className="h-8 w-auto object-contain"
                />
              </div>
              <span className="font-['Anton',sans-serif] text-xl text-[#281812] uppercase tracking-wide">
                STANDUP TIMIKA
              </span>
            </Link>
            <p className="font-['Work_Sans',sans-serif] text-sm text-[#5C4037] leading-relaxed">
              Komunitas komedi tunggal independen di bumi Mimika, Papua. Wadah terbuka mengolah keresahan hidup menjadi punchline tajam tanpa sensor.
            </p>
            <div className="inline-block">
              <span className="px-2.5 py-1 bg-[#FFE9E3] text-[#A83300] font-['Space_Mono',monospace] text-xs font-bold border border-black uppercase tracking-wider">
                EST. TIMIKA - PAPUA
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-3">
            <span className="font-['Anton',sans-serif] text-lg text-[#281812] uppercase tracking-wider">
              NAVIGATION
            </span>
            <nav className="flex flex-col gap-2 font-['Space_Mono',monospace] text-sm font-bold text-[#281812]">
              <Link href="/talents" className="hover:text-[#FF4500] hover:translate-x-1 transition-all w-fit">
                → THE LINEUP (TALENTS)
              </Link>
              <Link href="/events" className="hover:text-[#FF4500] hover:translate-x-1 transition-all w-fit">
                → THE GRIND (EVENTS)
              </Link>
              <Link href="/store" className="hover:text-[#FF4500] hover:translate-x-1 transition-all w-fit">
                → OFFICIAL STORE
              </Link>
              <Link href="/about" className="hover:text-[#FF4500] hover:translate-x-1 transition-all w-fit">
                → ABOUT & ARCHIVES
              </Link>
              <Link href="/login" className="hover:text-[#FF4500] hover:translate-x-1 transition-all w-fit text-[#A83300]">
                → ACCESS PORTAL
              </Link>
            </nav>
          </div>

          {/* Column 3: Community HQ & Contact */}
          <div className="flex flex-col gap-3">
            <span className="font-['Anton',sans-serif] text-lg text-[#281812] uppercase tracking-wider">
              HEADQUARTERS
            </span>
            <div className="flex flex-col gap-2.5 font-['Work_Sans',sans-serif] text-sm text-[#5C4037]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FF4500] mt-0.5 shrink-0" />
                <span>SKY COFFEE25, Jl. Bhayangkara, Koperapoka, Mimika Baru, Papua Tengah 99971</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF4500] shrink-0" />
                <a href="mailto:standupindotimika@gmail.com" className="hover:underline">
                  standupindotimika@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 font-['Space_Mono',monospace] text-xs font-bold text-[#281812]">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:bg-[#FFE9E3] hover:text-[#FF4500] transition-colors"
                aria-label="Social Link"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:bg-[#FFE9E3] hover:text-[#FF4500] transition-colors"
                aria-label="Media Link"
              >
                <Video className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 4: Legal & Guidelines */}
          <div className="flex flex-col gap-3">
            <span className="font-['Anton',sans-serif] text-lg text-[#281812] uppercase tracking-wider">
              LEGAL & COMMUNITY
            </span>
            <div className="flex flex-col gap-2 font-['Space_Mono',monospace] text-xs font-bold text-[#5C4037]">
              <Link href="/about" className="hover:text-[#281812] transition-colors">
                CODE OF CONDUCT
              </Link>
              <Link href="/about" className="hover:text-[#281812] transition-colors">
                OPEN MIC GUIDELINES
              </Link>
              <Link href="/about" className="hover:text-[#281812] transition-colors">
                TERMS OF TICKETING
              </Link>
              <Link href="/about" className="hover:text-[#281812] transition-colors">
                PRIVACY POLICY
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Sub-footer Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-['Space_Mono',monospace] text-xs text-[#5C4037]">
          <div>
            <span>© 2026 STANDUPINDO TIMIKA. ALL RIGHTS RESERVED. NO JOKE.</span>
          </div>

          {/* Watermark */}
          <div className="text-center md:text-right">
            <span>Dibuat oleh Muhammad Amin Hidayat dari </span>
            <a
              href="https://www.nokara.id"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#281812] hover:text-[#FF4500] hover:underline decoration-1 transition-colors inline-flex items-center gap-0.5"
            >
              www.nokara.id
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
