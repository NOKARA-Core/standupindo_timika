import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full bg-[#FDFBF7] py-16 px-6 md:px-12 lg:px-20 border-t-2 border-black">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand Name & Logo */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative h-10 w-auto flex items-center justify-center border-2 border-black bg-white p-1 shadow-[2px_2px_0px_0px_#000000]">
            <Image
              src="/logo-stup_timika.png"
              alt="StandUp INDO Timika"
              width={160}
              height={40}
              className="h-8 w-auto object-contain"
            />
          </div>
          <span className="font-['Anton',sans-serif] text-2xl md:text-3xl text-[#281812] uppercase tracking-wide">
            STANDUP INDO TIMIKA
          </span>
        </Link>

        {/* Footer Navigation Links */}
        <div className="flex flex-wrap items-center gap-6 md:gap-8 font-['Space_Mono',monospace] text-sm font-bold text-[#281812] uppercase tracking-wider">
          <Link href="/talents" className="hover:text-[#FF4500] transition-colors">
            TALENTS
          </Link>
          <Link href="/events" className="hover:text-[#FF4500] transition-colors">
            EVENTS
          </Link>
          <Link href="/store" className="hover:text-[#FF4500] transition-colors">
            STORE
          </Link>
          <Link href="/about" className="hover:text-[#FF4500] transition-colors">
            ABOUT
          </Link>
        </div>

        {/* Copyright Note */}
        <div>
          <span className="font-['Space_Mono',monospace] text-xs text-[#5C4037] uppercase tracking-wider">
            © 2024 STANDUPINDO TIMIKA. NO JOKE.
          </span>
        </div>
      </div>
    </footer>
  );
}
