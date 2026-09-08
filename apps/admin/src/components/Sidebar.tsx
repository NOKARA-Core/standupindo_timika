"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { adminNavItems } from "../config/nav";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
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

      {/* Main Sidebar (Fixed, non-scrolling position) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 h-screen bg-white border-r border-gray-200 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:w-20" : "md:w-64"}`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Top Brand Header with Official Logo & Collapse Toggle */}
          <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-between shrink-0">
            <Link
              href="/"
              onClick={onClose}
              className={`flex items-center gap-2.5 group overflow-hidden ${
                isCollapsed ? "justify-center w-full" : ""
              }`}
            >
              <div className="h-9 w-9 p-1 bg-white border border-gray-200 shadow-xs flex items-center justify-center shrink-0">
                <Image
                  src="/logo-stup_timika.png"
                  alt="StandUp INDO Timika"
                  width={32}
                  height={32}
                  className="h-7 w-auto object-contain"
                  priority
                />
              </div>

              {!isCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="font-bold text-xs uppercase tracking-wider text-gray-900 leading-tight truncate">
                    STANDUP TIMIKA
                  </span>
                  <span className="text-[10px] text-orange-600 font-semibold uppercase tracking-widest leading-none mt-0.5">
                    ADMIN PORTAL
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Button */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xs transition-colors cursor-pointer"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

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
          <nav className="p-3 space-y-1.5 flex-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium transition-colors duration-150 relative ${
                      isCollapsed
                        ? "justify-center"
                        : "justify-between"
                    } ${
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
                      {!isCollapsed && (
                        <span
                          className={`truncate ${
                            isActive ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
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

                  {/* Tooltip Hover for Collapsed Mode */}
                  {isCollapsed && (
                    <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-gray-900 text-white text-xs font-semibold rounded-xs shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer: User Card */}
          <div className="p-3 border-t border-gray-200 bg-gray-50/50 shrink-0">
            <div
              className={`flex items-center gap-3 px-1 py-1 ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                MA
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-gray-900 truncate">
                    M. Amin Hidayat
                  </span>
                  <span className="text-[10px] text-gray-500 truncate">
                    Super Administrator
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
