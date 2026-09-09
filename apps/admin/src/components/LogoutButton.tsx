"use client";

import { useState } from "react";
import { LogOut, AlertTriangle, Loader2 } from "lucide-react";

interface LogoutButtonProps {
  variant?: "header" | "sidebar";
  isCollapsed?: boolean;
}

export function LogoutButton({
  variant = "header",
  isCollapsed = false,
}: LogoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      const data = await res.json();
      const redirectTarget =
        data.redirectUrl ||
        process.env.NEXT_PUBLIC_WEB_URL ||
        "http://localhost:5000/login";

      window.location.href = redirectTarget.includes("/login")
        ? redirectTarget
        : `${redirectTarget}/login`;
    } catch (err) {
      console.error("Logout request failed:", err);
      // Fallback redirect
      window.location.href = "http://localhost:5000/login";
    }
  };

  return (
    <>
      {variant === "header" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 px-3 py-1.5 transition-all cursor-pointer shadow-xs active:translate-y-0.5"
          title="Keluar dari sesi Admin"
          aria-label="Logout"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      ) : (
        /* Sidebar Variant */
        <div className="w-full relative group">
          {isCollapsed ? (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="w-full flex items-center justify-center p-2 text-red-600 hover:text-white hover:bg-red-600 border border-transparent hover:border-red-600 rounded-sm transition-colors cursor-pointer"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 transition-colors cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span>LOGOUT</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">
                Keluar
              </span>
            </button>
          )}

          {isCollapsed && (
            <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-xs shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Keluar / Logout
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border-4 border-black p-6 max-w-md w-full shadow-[8px_8px_0px_0px_#000000] relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FFE9E3] border-2 border-black flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-['Space_Mono',monospace] font-black text-base text-gray-900 uppercase tracking-tight">
                  Konfirmasi Logout
                </h3>
                <p className="text-xs text-gray-600">
                  Panel Operasi StandUp INDO Timika
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-6 font-medium">
              Apakah Anda yakin ingin mengakhiri sesi admin saat ini? Anda harus memasukkan kredensial kembali untuk mengakses panel kontrol.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-gray-100">
              <button
                type="button"
                disabled={loading}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border-2 border-black font-bold text-xs uppercase tracking-wider hover:bg-gray-100 cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white border-2 border-black font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:bg-red-700 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Ya, Logout Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
