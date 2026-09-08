"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Mic2,
  DollarSign,
  Users,
  Image as ImageIcon,
  Settings,
  ExternalLink,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

// LOCKED ORDER according to DESIGN-SYSTEM.md
const sidebarLinks = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Comedians", href: "/comedians", icon: Mic2 },
  { label: "Finances", href: "/finances", icon: DollarSign },
  { label: "Members", href: "/members", icon: Users },
  { label: "Media Assets", href: "/media", icon: ImageIcon },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic Page Title
  const getPageTitle = () => {
    if (pathname === "/") return "Overview Dashboard";
    const found = sidebarLinks.find((item) =>
      item.href !== "/" ? pathname.startsWith(item.href) : false
    );
    return found ? found.label : "Portal Administration";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-900 font-sans">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* Left Sidebar (Locked Structure) */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center font-bold text-sm tracking-wider">
                ST
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs uppercase tracking-wider text-gray-900">
                  StandUp Timika
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                  Admin Portal
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-900 p-1"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items (Locked order) */}
          <nav className="p-4 space-y-1">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-900 text-white font-semibold shadow-xs"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-gray-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-8 h-8 bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold border border-gray-300">
              AH
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-gray-900 truncate">
                Muhammad Amin H.
              </span>
              <span className="text-[10px] text-gray-500 truncate">
                Super Admin
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header (Locked layout: Page Title on left; Notifications & Profile on right) */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-900 p-1.5 border border-gray-200"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Quick Action: View Live Landing Page */}
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 transition-colors"
            >
              <span>View Landing Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            </a>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-colors relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
                MA
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
