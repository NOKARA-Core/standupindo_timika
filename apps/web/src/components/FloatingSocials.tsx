"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Phone, Globe, Video, X } from "lucide-react";

interface SocialLink {
  name: string;
  href: string;
  label: string;
  icon: typeof Phone;
  bg: string;
}

const socialLinks: SocialLink[] = [
  {
    name: "WhatsApp",
    href: "https://wa.me/6281234567890?text=Halo%20StandUp%20Timika!%20Info%20Open%20Mic%20dong",
    label: "CHAT WA",
    icon: Phone,
    bg: "bg-[#25D366] text-black",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/standupindo_timika",
    label: "INSTAGRAM",
    icon: Globe,
    bg: "bg-[#FF4500] text-white",
  },
  {
    name: "Facebook",
    href: "https://facebook.com/standupindo.timika",
    label: "FACEBOOK",
    icon: Video,
    bg: "bg-[#281812] text-white",
  },
];

export function FloatingSocials() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside (important for reliable mobile interaction)
  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none"
    >
      {/* Sub-buttons list expanding upwards with staggered spring delay */}
      <div
        className={`flex flex-col items-end gap-3 origin-bottom transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-90 translate-y-4 pointer-events-none"
        }`}
      >
        {socialLinks.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
              }}
              className="flex items-center gap-2 group cursor-pointer transition-all duration-200"
            >
              {/* Tooltip Label */}
              <span className="px-2.5 py-1 bg-white text-black font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000] opacity-95 group-hover:opacity-100 group-hover:bg-[#FFE9E3] group-hover:translate-x-[-2px] transition-all">
                {item.label}
              </span>

              {/* Icon Button with tactile click feedback */}
              <div
                className={`w-11 h-11 ${item.bg} border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] group-hover:scale-105 transition-all`}
              >
                <Icon className="w-5 h-5 stroke-[2.5]" />
              </div>
            </a>
          );
        })}
      </div>

      {/* Main Trigger FAB with click/tap toggle and click-outside protection */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-label="Toggle Social Media Contacts"
        className="w-14 h-14 bg-[#FF4500] hover:bg-[#e03d00] text-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] flex items-center justify-center cursor-pointer transition-all duration-200 relative group"
      >
        {isOpen ? (
          <X className="w-7 h-7 text-white stroke-[2.5] transition-transform rotate-90 duration-200" />
        ) : (
          <MessageSquare className="w-7 h-7 text-white stroke-[2.5] group-hover:scale-110 transition-transform duration-200" />
        )}

        {/* Pulse badge to invite interaction */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-black border border-white" />
        )}
      </button>
    </div>
  );
}
