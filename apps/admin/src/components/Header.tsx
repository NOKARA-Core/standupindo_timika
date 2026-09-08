"use client";

import { usePathname } from "next/navigation";
import { Menu, ExternalLink, Bell } from "lucide-react";
import { adminNavItems } from "../config/nav";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();

  // Determine dynamic title from nav config
  const getCurrentTitle = () => {
    if (pathname === "/") return "Operations Overview";
    const found = adminNavItems.find((item) =>
      item.href !== "/" ? pathname.startsWith(item.href) : false
    );
    return found ? `${found.label} Management` : "StandUp INDO Timika Operations Center";
  };

  const webUrl =
    process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:5000";

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Dynamic Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-base md:text-lg font-bold text-gray-900 leading-tight">
            {getCurrentTitle()}
          </h1>
          <span className="hidden sm:inline-block text-[11px] text-gray-500 font-medium">
            StandUp INDO Timika Community Operations
          </span>
        </div>
      </div>

      {/* Right: Quick Action, Notification & Avatar */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Quick External Link to Web App (Port 5000) */}
        <a
          href={webUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 transition-colors"
        >
          <span>View Live Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
        </a>

        {/* Notification Bell */}
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-colors relative cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            MA
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-gray-900 leading-tight">
              M. Amin
            </span>
            <span className="text-[10px] text-gray-500 leading-tight">
              Ketua Timika
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
