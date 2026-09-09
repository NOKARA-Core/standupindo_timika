"use client";

import { useState } from "react";
import { Eye, Shield, Sliders, ChevronDown, ChevronUp, Check } from "lucide-react";

export type PreviewMode = "auto" | "static" | "dynamic";

interface AdminPreviewBarProps {
  publicModeIsDynamic: boolean;
  activePreviewMode: PreviewMode;
  onSelectMode: (mode: PreviewMode) => void;
}

export function AdminPreviewBar({
  publicModeIsDynamic,
  activePreviewMode,
  onSelectMode,
}: AdminPreviewBarProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const effectiveMode =
    activePreviewMode === "auto"
      ? publicModeIsDynamic
        ? "dynamic"
        : "static"
      : activePreviewMode;

  return (
    <aside
      aria-label="Admin Preview Bar"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9990] w-[95%] max-w-xl transition-all duration-200 pointer-events-auto select-none"
    >
      <div className="bg-black text-white border-2 border-black shadow-[6px_6px_0px_0px_#FF4500] p-3 md:p-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Status Label */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                publicModeIsDynamic ? "bg-emerald-400 animate-pulse" : "bg-gray-400"
              }`}
            />
            <div className="flex flex-col">
              <span className="font-['Space_Mono',monospace] text-[10px] uppercase tracking-wider text-gray-300 font-bold flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-[#FF4500]" />
                <span>ADMIN PREVIEW BAR</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">
                  PUBLIK: {publicModeIsDynamic ? "DINAMIS" : "STATIS"}
                </span>
              </span>
              {!isMinimized && (
                <span className="text-[11px] text-gray-200 font-semibold mt-0.5">
                  Tampilan Saat Ini:{" "}
                  <strong className="text-[#FF4500] uppercase font-['Space_Mono',monospace]">
                    {effectiveMode === "dynamic" ? "Mode Dinamis (Cloud)" : "Mode Statis (Bawaan)"}
                  </strong>
                  {activePreviewMode !== "auto" && (
                    <span className="ml-1 text-[9px] bg-yellow-400 text-black px-1.5 py-0.2 font-bold uppercase">
                      LOKAL OVERRIDE
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Minimize / Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            title={isMinimized ? "Buka Preview Bar" : "Kecilkan Preview Bar"}
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Buttons Controls (Visible when not minimized) */}
        {!isMinimized && (
          <div className="mt-3 pt-2.5 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {/* Option 1: Auto (Follow DB) */}
              <button
                type="button"
                onClick={() => onSelectMode("auto")}
                className={`px-2.5 py-1 text-[11px] font-['Space_Mono',monospace] font-bold uppercase transition-all cursor-pointer border ${
                  activePreviewMode === "auto"
                    ? "bg-white text-black border-white shadow-[2px_2px_0px_0px_#FF4500]"
                    : "bg-gray-900 text-gray-400 border-gray-700 hover:text-white hover:border-gray-500"
                }`}
              >
                Auto (DB)
              </button>

              {/* Option 2: Force Static */}
              <button
                type="button"
                onClick={() => onSelectMode("static")}
                className={`px-2.5 py-1 text-[11px] font-['Space_Mono',monospace] font-bold uppercase transition-all cursor-pointer border ${
                  activePreviewMode === "static"
                    ? "bg-yellow-400 text-black border-yellow-400 shadow-[2px_2px_0px_0px_#000]"
                    : "bg-gray-900 text-gray-400 border-gray-700 hover:text-white hover:border-gray-500"
                }`}
              >
                Force Statis
              </button>

              {/* Option 3: Force Dynamic */}
              <button
                type="button"
                onClick={() => onSelectMode("dynamic")}
                className={`px-2.5 py-1 text-[11px] font-['Space_Mono',monospace] font-bold uppercase transition-all cursor-pointer border ${
                  activePreviewMode === "dynamic"
                    ? "bg-[#FF4500] text-white border-[#FF4500] shadow-[2px_2px_0px_0px_#FFF]"
                    : "bg-gray-900 text-gray-400 border-gray-700 hover:text-white hover:border-gray-500"
                }`}
              >
                Force Dinamis
              </button>
            </div>

            <div className="text-[10px] text-gray-400 font-mono hidden sm:inline-block">
              Param: <code className="text-gray-300">?view_mode=static|dynamic</code>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
