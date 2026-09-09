"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { adminNavItems, filterNavByRole } from "../config/nav";
import { LogoutButton } from "./LogoutButton";
import { useAuth } from "../context/AuthContext";

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
  const { role, user, switchRole } = useAuth();
  const visibleNavItems = filterNavByRole(adminNavItems, role);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Drawer / Static Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 h-screen bg-[#FDFBF7] border-r-4 border-black flex flex-col justify-between transition-all duration-200 ease-in-out shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header Brand Section */}
          <div className="h-20 px-4 border-b-4 border-black flex items-center shrink-0 bg-white">
            {isCollapsed ? (
              /* When Collapsed on Desktop/Tablet: Center toggle button cleanly */
              <div className="w-full flex items-center justify-center">
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="p-2 text-black bg-[#FFD700] hover:bg-[#FFE55C] border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-transform cursor-pointer"
                  title="Expand Sidebar"
                  aria-label="Expand Sidebar"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              /* When Expanded: Logo & branding on left, toggle on right */
              <div className="w-full flex items-center justify-between gap-2">
                <Link
                  href="/"
                  onClick={onClose}
                  className="flex items-center gap-2.5 group overflow-hidden"
                >
                  <div className="h-10 w-10 p-1 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center shrink-0">
                    <Image
                      src="/logo-stup_timika.png"
                      alt="StandUp INDO Timika"
                      width={36}
                      height={36}
                      className="h-8 w-auto object-contain"
                      priority
                    />
                  </div>

                  <div className="flex flex-col truncate">
                    <span className="font-mono font-black text-xs uppercase tracking-wider text-gray-900 leading-tight truncate">
                      STANDUP INDO TIMIKA
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className={`text-[9px] font-mono font-black px-1.5 py-0.2 border-2 border-black uppercase shadow-[1px_1px_0px_0px_#000] ${
                          role === "superadmin"
                            ? "bg-[#FFD700] text-black"
                            : "bg-[#FF4500] text-white"
                        }`}
                      >
                        {role === "superadmin" ? "SUPERADMIN" : "CURATOR"}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Desktop / Tablet Collapse Toggle */}
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden lg:flex p-1.5 text-black hover:bg-zinc-100 border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer bg-white"
                  title="Collapse Sidebar"
                  aria-label="Collapse Sidebar"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* Mobile Slide-over Drawer Close Button (Big Sharp Neo-brutalist X) */}
                <button
                  type="button"
                  onClick={onClose}
                  className="lg:hidden p-1.5 text-black bg-red-500 hover:bg-red-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  aria-label="Close Sidebar"
                >
                  <X className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Menu Items */}
          <nav className="p-3.5 space-y-2 flex-1">
            {visibleNavItems.map((item) => {
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
                    className={`flex items-center px-4 py-3 font-mono font-bold tracking-wider text-sm uppercase transition-all duration-100 ${
                      isCollapsed
                        ? "justify-center px-2"
                        : "justify-between"
                    } ${
                      isActive
                        ? "bg-[#FFD700] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] -translate-x-0.5 -translate-y-0.5"
                        : "text-zinc-800 border-2 border-transparent hover:bg-white hover:border-2 hover:border-black hover:shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 shrink-0 stroke-[2.2] transition-colors ${
                          isActive ? "text-black" : "text-zinc-700 group-hover:text-black"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-mono font-black px-2 py-0.5 border-2 border-black shadow-[1px_1px_0px_0px_#000] ${
                          isActive
                            ? "bg-black text-white"
                            : "bg-[#FF4500] text-white"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Tooltip on Hover for Compact / Collapsed Mode */}
                  {isCollapsed && (
                    <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-black text-white text-xs font-mono font-bold uppercase border-2 border-black shadow-[3px_3px_0px_0px_#FFD700] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User Profile & Logout Footer */}
          <div className="p-3.5 border-t-4 border-black bg-white shrink-0 space-y-2.5">
            <div
              className={`flex items-center gap-3 p-2 bg-[#FDFBF7] border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                isCollapsed ? "justify-center p-1.5" : ""
              }`}
            >
              <div
                className={`w-9 h-9 text-white font-mono font-black flex items-center justify-center text-xs shrink-0 border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] ${
                  role === "superadmin" ? "bg-black text-[#FFD700]" : "bg-[#FF4500] text-white"
                }`}
              >
                {role === "superadmin" ? "SA" : "CR"}
              </div>

              {!isCollapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-mono font-bold text-gray-900 truncate">
                    {user?.name || (role === "superadmin" ? "Administrator" : "Curator Konten")}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[9px] font-mono font-black px-1.5 py-0.2 border border-black uppercase ${
                        role === "superadmin"
                          ? "bg-emerald-300 text-black"
                          : "bg-purple-300 text-black"
                      }`}
                    >
                      {role}
                    </span>
                    <button
                      type="button"
                      onClick={() => switchRole(role === "superadmin" ? "curator" : "superadmin")}
                      className="text-[9px] font-mono text-zinc-600 hover:text-black underline font-bold cursor-pointer"
                      title="Ganti Mode Role untuk simulasi RBAC"
                    >
                      [Switch]
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <LogoutButton variant="sidebar" isCollapsed={isCollapsed} />
          </div>
        </div>
      </aside>
    </>
  );
}
