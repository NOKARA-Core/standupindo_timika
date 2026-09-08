"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "TALENTS", href: "/talents" },
  { label: "EVENTS", href: "/events" },
  { label: "STORE", href: "/store" },
  { label: "ABOUT", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FDFBF7] border-b-2 border-[#281812]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 h-[82px] flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative h-10 w-auto flex items-center justify-center border-2 border-black bg-white p-1 shadow-[2px_2px_0px_0px_#000000] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
            <Image
              src="/logo-stup_timika.png"
              alt="StandUp INDO Timika Logo"
              width={160}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>
          <span className="font-['Anton',sans-serif] text-xl md:text-2xl lg:text-[30px] tracking-wide text-[#281812] uppercase select-none">
            STANDUP INDO TIMIKA
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-['Space_Mono',monospace] text-sm font-bold tracking-wider text-[#281812]">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-1 uppercase transition-colors relative ${
                  isActive
                    ? "text-[#FF4500] border-b-4 border-black"
                    : "hover:text-[#FF4500]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Login Button */}
        <div className="flex items-center">
          <Link
            href="/login"
            className="px-6 py-2 bg-[#A83300] hover:bg-[#8f2b00] text-white font-['Space_Mono',monospace] text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            LOGIN
          </Link>
        </div>
      </div>
    </header>
  );
}
