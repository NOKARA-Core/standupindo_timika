"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, MessageCircle, Check, Package } from "lucide-react";
import { AnimateReveal } from "./AnimateReveal";
import { DBMerchandise } from "../lib/site-config.server";

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
  const [cartCount, setCartCount] = useState<number>(0);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
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

  const handleAddToCart = (name: string) => {
    setCartCount((prev) => prev + 1);
    setLastAdded(name);
    setTimeout(() => setLastAdded(null), 2500);
  };

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

          {/* Cart Status Indicator */}
          <div className="flex items-center gap-3 bg-white border-4 border-black px-6 py-3 shadow-[6px_6px_0px_0px_#000000]">
            <ShoppingBag className="w-6 h-6 text-[#FF4500]" />
            <span className="font-['Space_Mono',monospace] text-sm font-bold uppercase tracking-wider">
              BAG ({cartCount} ITEMS)
            </span>
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

      {/* Feedback Alert Toast */}
      {lastAdded && (
        <div className="mb-8 p-4 bg-[#FFE9E3] border-2 border-black shadow-[4px_4px_0px_0px_#000000] flex items-center gap-3">
          <Check className="w-5 h-5 text-[#FF4500]" />
          <span className="font-['Space_Mono',monospace] text-sm font-bold text-[#281812]">
            &quot;{lastAdded}&quot; BERHASIL DITAMBAHKAN KE CART!
          </span>
        </div>
      )}

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
            const isOutOfStock = product.stock <= 0;

            // Pre-built WhatsApp order message according to specification
            const orderMessage = `Halo StandUP INDO Timika, saya ingin memesan merchandise: ${product.name} seharga ${formattedPrice}. Apakah stok masih tersedia?`;
            const waOrderUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage)}`;

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
                          isOutOfStock
                            ? "bg-red-500 text-white"
                            : "bg-[#FFE9E3] text-[#A83300]"
                        }`}
                      >
                        {isOutOfStock ? "OUT OF STOCK" : `STOK: ${product.stock}`}
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
                        {product.description || "Official merchandise StandUp INDO Timika dengan material premium dan desain otentik komedi."}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2.5 pt-2">
                      {/* WhatsApp Checkout Click-to-Chat Button */}
                      <a
                        href={waOrderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-[#10B981] hover:bg-emerald-400 text-black font-['Space_Mono',monospace] text-xs md:text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 text-black" />
                        <span>ORDER VIA WHATSAPP</span>
                      </a>

                      {/* Quick Add to Cart */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product.name)}
                        className="w-full py-2.5 bg-black hover:bg-[#281812] text-white font-['Space_Mono',monospace] text-xs font-bold tracking-wider uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>ADD TO BAG</span>
                      </button>
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
