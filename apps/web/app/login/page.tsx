"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, Lock } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 md:p-12 selection:bg-[#FF4500] selection:text-white">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 md:top-8 md:left-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-black font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_#000000] hover:bg-[#FFE9E3] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO HOME</span>
        </Link>
      </div>

      {/* Main Split Container: 2 Columns with border-4 & hard shadow */}
      <div className="w-full max-w-4xl bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 md:grid-cols-2 overflow-hidden my-12">
        {/* Left Column: Full-height grayscale stand-up stage graphic representation */}
        <div className="bg-[#281812] border-b-4 md:border-b-0 md:border-r-4 border-black p-8 md:p-12 flex flex-col justify-between relative overflow-hidden grayscale min-h-[360px] md:min-h-[580px]">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Top Stamp */}
          <div className="relative z-10">
            <span className="px-3 py-1 bg-white text-black font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-widest border-2 border-black inline-block">
              INTERNAL ONLY
            </span>
          </div>

          {/* Center Stage Graphic Text */}
          <div className="relative z-10 my-auto text-left py-8">
            <span className="font-['Anton',sans-serif] text-5xl md:text-6xl text-white uppercase tracking-tight block leading-tight">
              STANDUPINDO
              <br />
              TIMIKA
            </span>
            <span className="font-['Anton',sans-serif] text-2xl md:text-3xl text-white/80 uppercase tracking-wide block mt-2">
              ADMINISTRATION PORTAL
            </span>
            <p className="font-['Space_Mono',monospace] text-xs text-white/60 uppercase tracking-widest mt-4 border-t-2 border-white/20 pt-4">
              SECURE ACCESS FOR COMEDIANS & ORGANIZERS
            </p>
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-10 flex items-center gap-2 font-['Space_Mono',monospace] text-[11px] text-white/70">
            <Lock className="w-3.5 h-3.5 text-white" />
            <span>ENCRYPTED PROTOCOL • PAPUA NODE</span>
          </div>
        </div>

        {/* Right Column: Form with white background & generous padding */}
        <div className="bg-white p-8 md:p-12 flex flex-col justify-between">
          {/* Top: Logo & Portal Title */}
          <div>
            <div className="flex items-center gap-3 mb-6">
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
            </div>

            <h1 className="font-['Anton',sans-serif] text-3xl md:text-4xl text-[#281812] uppercase tracking-wide">
              ACCESS PORTAL
            </h1>
            <p className="font-['Space_Mono',monospace] text-xs font-bold text-[#5C4037] uppercase tracking-wider mt-1">
              STANDUPINDO TIMIKA
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 my-8">
            {/* Username Input */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="font-['Space_Mono',monospace] text-xs font-bold text-[#281812] uppercase tracking-wider"
              >
                USERNAME / ID
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ENTER ID"
                className="w-full bg-[#FFF8F6] border-2 border-black px-4 py-3 font-['Space_Mono',monospace] text-sm text-[#281812] placeholder-[#5C4037]/60 rounded-none focus:outline-none focus:ring-2 focus:ring-[#FF4500] shadow-[3px_3px_0px_0px_#000000]"
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="font-['Space_Mono',monospace] text-xs font-bold text-[#281812] uppercase tracking-wider"
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
                className="w-full bg-[#FFF8F6] border-2 border-black px-4 py-3 font-['Space_Mono',monospace] text-sm text-[#281812] placeholder-[#5C4037]/60 rounded-none focus:outline-none focus:ring-2 focus:ring-[#FF4500] shadow-[3px_3px_0px_0px_#000000]"
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-none border-2 border-black text-[#FF4500] focus:ring-0 cursor-pointer accent-[#FF4500]"
              />
              <label
                htmlFor="remember"
                className="font-['Space_Mono',monospace] text-xs font-bold text-[#281812] uppercase tracking-wider cursor-pointer"
              >
                REMEMBER ACCESS
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3.5 bg-[#FF4500] hover:bg-[#e03d00] text-white font-['Space_Mono',monospace] text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>AUTHENTICATE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {submitted && (
              <div className="p-3 bg-[#FFE9E3] border-2 border-black text-xs font-['Space_Mono',monospace] font-bold text-[#A83300] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#A83300]" />
                <span>AUTHENTICATION VERIFIED. REDIRECTING...</span>
              </div>
            )}
          </form>

          {/* Footer of Form Box */}
          <div className="pt-4 border-t-2 border-black/20 flex items-center justify-between font-['Space_Mono',monospace] text-xs">
            <span className="text-[#5C4037] font-medium">NEED ACCESS?</span>
            <Link
              href="mailto:standupindotimika@gmail.com"
              className="text-[#FF4500] font-bold underline decoration-2 uppercase hover:text-black"
            >
              REQUEST ACCESS KEY
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
