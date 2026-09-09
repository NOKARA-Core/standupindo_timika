"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

export function NeoPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show
  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="mt-12 pt-8 border-t-4 border-black flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
      {/* Items count indicator */}
      <div className="font-['Space_Mono',monospace] text-xs md:text-sm font-bold text-[#5C4037]">
        MENAMPILKAN <span className="text-[#281812] underline decoration-2">{startItem} - {endItem}</span> DARI{" "}
        <span className="text-[#281812]">{totalItems}</span> DATA
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Prev Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className={`px-3 py-2 border-2 border-black font-['Space_Mono',monospace] text-xs font-black uppercase flex items-center gap-1 transition-all ${
            currentPage === 1
              ? "bg-[#EAE5DF] text-[#8C827A] border-[#8C827A] cursor-not-allowed opacity-60"
              : "bg-white text-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#FFE9E3] hover:text-[#FF4500] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] cursor-pointer"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">PREV</span>
        </button>

        {/* Numeric Page Buttons */}
        {pageNumbers.map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 md:w-10 md:h-10 border-2 border-black font-['Space_Mono',monospace] text-xs md:text-sm font-black flex items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? "bg-[#FF4500] text-white shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                  : "bg-white text-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#FFE9E3] hover:text-[#FF4500] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000]"
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className={`px-3 py-2 border-2 border-black font-['Space_Mono',monospace] text-xs font-black uppercase flex items-center gap-1 transition-all ${
            currentPage === totalPages
              ? "bg-[#EAE5DF] text-[#8C827A] border-[#8C827A] cursor-not-allowed opacity-60"
              : "bg-white text-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#FFE9E3] hover:text-[#FF4500] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] cursor-pointer"
          }`}
        >
          <span className="hidden sm:inline">NEXT</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
