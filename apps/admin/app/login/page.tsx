"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Lock, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(
          data.error || "Autentikasi gagal. Silakan periksa kredensial Anda."
        );
        setLoading(false);
        return;
      }

      setSuccessMsg("Autentikasi berhasil. Mengarahkan ke Dashboard...");
      setTimeout(() => {
        window.location.href = "/";
      }, 600);
    } catch {
      setErrorMsg("Gagal terhubung ke server autentikasi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 md:p-12 selection:bg-[#FF4500] selection:text-white">
      <div className="w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-10 flex flex-col justify-between">
        {/* Header Branding */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative h-10 w-auto flex items-center justify-center border-2 border-black bg-white p-1 shadow-[2px_2px_0px_0px_#000000]">
              <Image
                src="/logo-stup_timika.png"
                alt="StandUp INDO Timika Logo"
                width={140}
                height={36}
                className="h-8 w-auto object-contain"
                priority
              />
            </div>
            <span className="px-2.5 py-1 bg-black text-white font-mono text-[11px] font-bold uppercase tracking-widest border border-black">
              ADMIN ONLY
            </span>
          </div>

          <h1 className="font-['Anton',sans-serif] text-3xl md:text-4xl text-[#281812] uppercase tracking-wide">
            PORTAL KONTROL
          </h1>
          <p className="font-mono text-xs font-bold text-[#5C4037] uppercase tracking-wider mt-1">
            STANDUPINDO TIMIKA
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 my-8">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="font-mono text-xs font-bold text-[#281812] uppercase tracking-wider"
            >
              EMAIL / USERNAME
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@standuptimika.com"
              className="w-full bg-[#FFF8F6] border-2 border-black px-4 py-3 font-mono text-sm text-[#281812] placeholder-[#5C4037]/60 rounded-none focus:outline-none focus:ring-2 focus:ring-[#FF4500] shadow-[3px_3px_0px_0px_#000000]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="font-mono text-xs font-bold text-[#281812] uppercase tracking-wider"
            >
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FFF8F6] border-2 border-black px-4 py-3 font-mono text-sm text-[#281812] placeholder-[#5C4037]/60 rounded-none focus:outline-none focus:ring-2 focus:ring-[#FF4500] shadow-[3px_3px_0px_0px_#000000]"
            />
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3 bg-red-100 border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-xs font-mono font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div className="p-3 bg-[#FFE9E3] border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-xs font-mono font-bold text-[#A83300] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#A83300] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-[#FF4500] hover:bg-[#e03d00] disabled:opacity-50 text-white font-mono text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{loading ? "MEMVERIFIKASI..." : "MASUK KE DASHBOARD"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Security Stamp */}
        <div className="pt-4 border-t-2 border-black/20 flex items-center justify-between font-mono text-[11px] text-[#5C4037]">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-black" />
            <span>SESSION ENCRYPTION</span>
          </div>
          <span className="font-bold text-black">NOKARA.ID</span>
        </div>
      </div>
    </div>
  );
}
