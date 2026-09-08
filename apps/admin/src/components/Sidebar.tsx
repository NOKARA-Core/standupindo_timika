"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { adminNavItems } from "../config/nav";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Top Brand Header with Official Logo */}
          <div className="h-16 px-5 border-b border-gray-200 flex items-center justify-between">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-3 group"
            >
              <div className="h-9 w-auto p-1 bg-white border border-gray-200 shadow-xs flex items-center justify-center">
                <Image
                  src="/logo-stup_timika.png"
                  alt="StandUp INDO Timika"
                  width={120}
                  height={32}
                  className="h-7 w-auto object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs uppercase tracking-wider text-gray-900 leading-tight">
                  STANDUP TIMIKA
                </span>
                <span className="text-[10px] text-orange-600 font-semibold uppercase tracking-widest leading-none mt-0.5">
                  ADMIN PORTAL
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="md:hidden text-gray-400 hover:text-gray-900 p-1 transition-colors"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3.5 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-none text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-gray-900 text-white font-semibold shadow-xs"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? "text-white" : "text-gray-500"
                      }`}
                    />
                    <span className={isActive ? "text-white" : "text-gray-700 hover:text-gray-900"}>
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 ${
                        isActive
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User Card */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
              MA
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-gray-900 truncate">
                M. Amin Hidayat
              </span>
              <span className="text-[10px] text-gray-500 truncate">
                Super Administrator
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
