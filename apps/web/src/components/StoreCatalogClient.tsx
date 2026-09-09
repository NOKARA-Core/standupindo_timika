"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { AnimateReveal } from "./AnimateReveal";
import type { DBMerchandise } from "../lib/types";
import { sanitizeOutboundUrl } from "../lib/security";
import { NeoPagination } from "./NeoPagination";

interface StoreCatalogClientProps {
  merchandise: DBMerchandise[];
  whatsappNumber: string;
}

const ITEMS_PER_PAGE = 6;

export function StoreCatalogClient({
  merchandise,
  whatsappNumber,
}: StoreCatalogClientProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  // Derive unique categories
  const categories = ["ALL", "T-Shirt", "Hoodie", "Aksesoris", "Tiket"];

  const filteredProducts = merchandise.filter((p) => {
    if (selectedFilter === "ALL") return true;
    return p.category.toLowerCase() === selectedFilter.toLowerCase();
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main className="flex-1 py-16 px-6 md:px-12 lg:px-20 max-w-[1280px] mx-auto w-full">
      {/* Header Section */}
      <AnimateReveal variant="slide-left" durationMs={650}>
        <div className="border-b-4 border-black pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-block px-3 py-1 bg-black text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-widest mb-3">
              OFFICIAL GEAR & MERCH
            </div>
            <h1 className="font-['Anton',sans-serif] text-5xl md:text-7xl text-[#281812] uppercase tracking-tight">
              THE STORE
            </h1>
            <p className="font-['Work_Sans',sans-serif] text-lg text-[#5C4037] mt-2 max-w-xl">
              Dukung pergerakan stand-up underground Timika lewat merchandise resmi, apparel, dan tiket pre-order langsung via WhatsApp pengurus.
            </p>
          </div>
        </div>
      </AnimateReveal>

      {/* Filter Pills */}
      <AnimateReveal variant="fade-up" delayMs={80} durationMs={650}>
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => handleFilterChange(filter)}
              className={`px-5 py-2.5 font-['Space_Mono',monospace] text-xs md:text-sm font-bold uppercase tracking-wider border-2 border-black cursor-pointer active:translate-x-[1px] active:translate-y-[1px] transition-all ${
                selectedFilter === filter
                  ? "bg-[#FF4500] text-white shadow-[4px_4px_0px_0px_#000000]"
                  : "bg-white text-[#281812] shadow-[4px_4px_0px_0px_#000000] hover:bg-[#FFE9E3]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </AnimateReveal>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_#000000]">
          <span className="font-['Anton',sans-serif] text-3xl text-[#281812] uppercase block">
            TIDAK ADA PRODUK
          </span>
          <p className="font-['Space_Mono',monospace] text-sm text-[#5C4037] mt-2">
            Belum ada item merchandise untuk kategori ini.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedProducts.map((product, index) => {
              const hasCustomImage = Boolean(product.imageUrl?.trim());
              const formattedPrice = `Rp ${Number(product.price).toLocaleString("id-ID")}`;

              // Determine product status
              const isComingSoon =
                product.status === "coming_soon" ||
                product.badge?.toUpperCase() === "COMING SOON";
              const isOutOfStock =
                !isComingSoon &&
                (product.stock <= 0 ||
                  product.status === "out_of_stock" ||
                  !product.isActive);

              // Pre-built WhatsApp order message according to specification
              const orderMessage = `Halo StandUP INDO Timika, saya ingin memesan merchandise: ${product.name} seharga ${formattedPrice}. Apakah stok masih tersedia?`;
              const rawWaOrderUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage)}`;
              const waOrderUrl = sanitizeOutboundUrl(rawWaOrderUrl) || `https://wa.me/${whatsappNumber}`;

              return (
                <AnimateReveal
                  key={product.id}
                  variant="fade-up"
                  delayMs={index * 85}
                  durationMs={650}
                >
                  <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-full">
                    {/* Product Visual Box */}
                    <div className="h-64 bg-[#FFF8F6] border-b-4 border-black p-4 flex flex-col justify-between relative overflow-hidden">
                      {/* Cloudinary Custom Product Image Layer */}
                      {hasCustomImage && product.imageUrl && (
                        <div className="absolute inset-0 z-0 bg-white">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-contain p-4"
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-start z-10 relative">
                        <span className="px-2.5 py-1 bg-black text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-wider">
                          {product.badge || product.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 font-['Space_Mono',monospace] text-[11px] font-bold border border-black uppercase ${
                            isComingSoon
                              ? "bg-[#DC2626] text-white"
                              : isOutOfStock
                              ? "bg-zinc-800 text-white"
                              : "bg-[#FFE9E3] text-[#A83300]"
                          }`}
                        >
                          {isComingSoon
                            ? "COMING SOON"
                            : isOutOfStock
                            ? "SOLD OUT"
                            : `Stok: ${product.stock} pcs`}
                        </span>
                      </div>

                      {!hasCustomImage && (
                        <div className="my-auto text-center z-10 relative">
                          <span className="font-['Anton',sans-serif] text-5xl text-[#281812] uppercase tracking-wider block opacity-20 select-none">
                            TIMIKA
                          </span>
                          <span className="font-['Anton',sans-serif] text-2xl text-[#FF4500] uppercase tracking-wide block mt-[-10px]">
                            OFFICIAL
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[10px] font-['Space_Mono',monospace] text-[#5C4037] uppercase z-10 relative">
                        <span>SKU: {product.id}</span>
                        <span>100% AUTHENTIC</span>
                      </div>
                    </div>

                    {/* Product Info & Actions */}
                    <div className="p-6 flex flex-col justify-between flex-1 gap-6">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h2 className="font-['Anton',sans-serif] text-2xl text-[#281812] uppercase tracking-wide">
                            {product.name}
                          </h2>
                        </div>

                        <div className="inline-block mb-3">
                          <span className="px-3 py-1 bg-[#10B981] text-black font-['Space_Mono',monospace] text-base font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                            {formattedPrice}
                          </span>
                        </div>

                        <p className="font-['Work_Sans',sans-serif] text-sm text-[#5C4037] leading-relaxed">
                          {product.description ||
                            "Official merchandise StandUp INDO Timika dengan material premium dan desain otentik komedi."}
                        </p>
                      </div>

                      {/* Purchase Action: Single Direct Order via WhatsApp or Neo-Brutalism Status Badge */}
                      <div className="pt-2">
                        {isComingSoon ? (
                          <div className="w-full py-3 bg-[#DC2626] text-white border-2 border-black rotate-[-2deg] font-black uppercase select-none px-4 py-2 cursor-not-allowed text-center shadow-[3px_3px_0px_0px_#000000] tracking-wider font-['Space_Mono',monospace] text-xs md:text-sm">
                            COMING SOON
                          </div>
                        ) : isOutOfStock ? (
                          <div className="w-full py-3 bg-zinc-800 text-white border-2 border-black rotate-[-2deg] font-black uppercase select-none px-4 py-2 cursor-not-allowed text-center shadow-[3px_3px_0px_0px_#000000] tracking-wider font-['Space_Mono',monospace] text-xs md:text-sm">
                            SOLD OUT / CLOSED
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            <a
                              href={waOrderUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-3 bg-[#10B981] hover:bg-emerald-400 text-black font-['Space_Mono',monospace] text-xs md:text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <MessageCircle className="w-4 h-4 text-black" />
                              <span>ORDER VIA WHATSAPP</span>
                            </a>
                            <div className="text-center font-['Space_Mono',monospace] text-[11px] text-[#5C4037] font-semibold">
                              Stok: {product.stock} pcs
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </AnimateReveal>
              );
            })}
          </div>

          {/* Pagination Controls per 6 items */}
          <NeoPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredProducts.length}
            pageSize={ITEMS_PER_PAGE}
          />
        </>
      )}
    </main>
  );
}
