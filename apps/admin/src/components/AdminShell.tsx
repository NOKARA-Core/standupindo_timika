"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { AuthProvider } from "../context/AuthContext";
import { AlertTriangle, X } from "lucide-react";

function AccessDeniedBanner() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const [fromPath, setFromPath] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("access_denied") === "true") {
      setShow(true);
      setFromPath(searchParams.get("from"));
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="mb-6 p-4 bg-red-100 border-2 border-red-600 text-red-950 font-mono text-xs flex items-center justify-between gap-3 shadow-[4px_4px_0px_0px_#991B1B]">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 animate-bounce" />
        <div>
          <span className="font-black uppercase tracking-wider">
            AKSES DITOLAK:
          </span>{" "}
          <span>
            Akun Anda dengan role <strong>CURATOR</strong> tidak memiliki izin mengakses modul{" "}
            {fromPath ? <code>{fromPath}</code> : "tersebut"}. Modul ini dibatasi khusus Super Administrator.
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setShow(false)}
        className="p-1 hover:bg-red-200 border border-red-800 text-red-900 cursor-pointer"
        title="Tutup pesan"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-900 font-sans antialiased">
      {/* Fixed Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      {/* Main Content Area - padded to not overlap fixed sidebar on desktop */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Suspense fallback={null}>
            <AccessDeniedBanner />
          </Suspense>
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AuthProvider>
  );
}
