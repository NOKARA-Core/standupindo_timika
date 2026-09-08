import Link from "next/link";
import { Mic } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#FDFBF7] border-b border-[#281812]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 h-[82px] flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-black border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000000] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
            <Mic className="w-6 h-6 text-[#FF4500]" strokeWidth={2.5} />
          </div>
          <span className="font-['Anton',sans-serif] text-2xl md:text-[32px] tracking-wide text-[#281812] uppercase select-none">
            STANDUP INDO TIMIKA
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-['Space_Mono',monospace] text-sm font-bold tracking-wider text-[#281812]">
          <Link
            href="#talents"
            className="hover:text-[#FF4500] uppercase transition-colors"
          >
            TALENTS
          </Link>
          <Link
            href="#schedule"
            className="hover:text-[#FF4500] uppercase transition-colors"
          >
            EVENTS
          </Link>
          <Link
            href="#store"
            className="hover:text-[#FF4500] uppercase transition-colors"
          >
            STORE
          </Link>
          <Link
            href="#about"
            className="hover:text-[#FF4500] uppercase transition-colors"
          >
            ABOUT
          </Link>
        </nav>

        {/* Login Button */}
        <div className="flex items-center">
          <Link
            href="/login"
            className="px-6 py-2 bg-[#A83300] hover:bg-[#8f2b00] text-white font-['Space_Mono',monospace] text-sm font-bold tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            LOGIN
          </Link>
        </div>
      </div>
    </header>
  );
}
