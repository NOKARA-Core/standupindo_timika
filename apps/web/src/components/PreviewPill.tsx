import Link from "next/link";

interface PreviewPillProps {
  isDynamic: boolean;
  viewMode?: string;
}

export function PreviewPill({ isDynamic, viewMode }: PreviewPillProps) {
  return (
    <aside
      aria-label="Mode Preview Web"
      className="fixed bottom-4 left-4 z-50 pointer-events-auto"
    >
      <div className="bg-black text-white border-2 border-black p-2 md:px-3 md:py-1.5 shadow-[3px_3px_0px_0px_#FF4500] flex items-center gap-2.5 text-xs font-['Space_Mono',monospace]">
        {/* Status Dot */}
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            isDynamic ? "bg-emerald-400 animate-pulse" : "bg-yellow-400"
          }`}
        />

        {/* Status Text */}
        <span className="font-bold text-[11px] tracking-wider uppercase">
          MODE:{" "}
          <span className={isDynamic ? "text-emerald-400" : "text-yellow-400"}>
            {isDynamic ? "DINAMIS" : "STATIS"}
          </span>
          {viewMode && (
            <span className="text-[9px] text-gray-400 ml-1">({viewMode})</span>
          )}
        </span>

        {/* Quick Toggle Links */}
        <div className="flex items-center gap-1 pl-2 border-l border-gray-700 text-[10px]">
          <Link
            href="/?view_mode=static"
            className={`px-1.5 py-0.5 border transition-colors ${
              !isDynamic && viewMode === "static"
                ? "bg-yellow-400 text-black border-yellow-400 font-bold"
                : "text-gray-300 hover:text-white border-gray-700 hover:border-gray-500"
            }`}
            title="Paksa tampilkan mode statis"
          >
            Statis
          </Link>
          <Link
            href="/?view_mode=dynamic"
            className={`px-1.5 py-0.5 border transition-colors ${
              isDynamic && viewMode === "dynamic"
                ? "bg-[#FF4500] text-white border-[#FF4500] font-bold"
                : "text-gray-300 hover:text-white border-gray-700 hover:border-gray-500"
            }`}
            title="Paksa tampilkan mode dinamis"
          >
            Dinamis
          </Link>
          {viewMode && (
            <Link
              href="/"
              className="text-gray-400 hover:text-white px-1 text-[9px] underline"
              title="Kembali ke mode publik database"
            >
              Reset
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
