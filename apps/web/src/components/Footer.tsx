import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#FDFBF7] py-16 px-6 md:px-12 lg:px-20 border-t-2 border-black">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand Name */}
        <div>
          <span className="font-['Anton',sans-serif] text-2xl md:text-3xl text-[#281812] uppercase tracking-wide">
            STANDUP INDO TIMIKA
          </span>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap items-center gap-6 md:gap-8 font-['Space_Mono',monospace] text-sm font-bold text-[#281812] uppercase tracking-wider">
          <Link
            href="#privacy"
            className="hover:text-[#FF4500] transition-colors"
          >
            PRIVACY
          </Link>
          <Link href="#terms" className="hover:text-[#FF4500] transition-colors">
            TERMS
          </Link>
          <Link
            href="#contact"
            className="hover:text-[#FF4500] transition-colors"
          >
            CONTACT
          </Link>
          <Link href="#press" className="hover:text-[#FF4500] transition-colors">
            PRESS
          </Link>
        </div>

        {/* Copyright Note */}
        <div>
          <span className="font-['Space_Mono',monospace] text-xs text-[#5C4037] uppercase tracking-wider">
            © 2024 CHUCKLE ZINE. NO JOKE.
          </span>
        </div>
      </div>
    </footer>
  );
}
