import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { AnimateReveal } from "./AnimateReveal";
import { MerchAssetConfig, defaultSiteConfig } from "../lib/site-config";
import type { DBMerchandise } from "../lib/types";
import { sanitizeOutboundUrl } from "../lib/security";

interface StoreSectionProps {
  merchConfig?: MerchAssetConfig[];
  merchandise?: DBMerchandise[];
  whatsappNumber?: string;
  isDynamic?: boolean;
}

export function StoreSection({
  merchConfig = defaultSiteConfig.merch,
  merchandise,
  whatsappNumber = "6282248566675",
  isDynamic = false,
}: StoreSectionProps) {
  // Use real DB merchandise if provided and non-empty, otherwise fallback to merchConfig
  const items =
    merchandise && merchandise.length > 0
      ? merchandise.slice(0, 4)
      : merchConfig.slice(0, 4).map((m) => ({
          id: m.id,
          name: m.name,
          price: m.price,
          description: m.description,
          badge: m.badge,
          imageUrl: m.imageUrl,
        }));

  return (
    <section
      id="store"
      className="w-full bg-[#FDFBF7] py-16 px-6 md:px-12 lg:px-20 border-b-2 border-black overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
        {/* Section Heading with snappy slide-left reveal */}
        <AnimateReveal variant="slide-left" durationMs={650}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                <ShoppingBag className="w-6 h-6 text-[#FF4500]" />
              </div>
              <h2 className="font-['Anton',sans-serif] text-3xl md:text-5xl text-[#281812] uppercase tracking-wide">
                THE MERCH
              </h2>
            </div>

            <Link
              href="/store"
              className="hidden md:inline-block font-['Space_Mono',monospace] text-sm font-bold text-[#FF4500] hover:text-black underline decoration-2 uppercase"
            >
              EXPLORE STORE →
            </Link>
          </div>
        </AnimateReveal>

        {/* Product Cards Grid with Staggered pop-in */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((product, index) => {
            const hasCustomImage = Boolean(product.imageUrl?.trim());
            const displayPrice =
              typeof product.price === "number"
                ? `Rp ${product.price.toLocaleString("id-ID")}`
                : product.price;

            const productStock = (product as any).stock;
            const isComingSoon =
              (product as any).status === "coming_soon" ||
              product.badge?.toUpperCase() === "COMING SOON";
            const isOutOfStock =
              !isComingSoon &&
              ((productStock !== undefined && productStock <= 0) ||
                (product as any).status === "out_of_stock");

            const orderMessage = `Halo StandUP INDO Timika, saya ingin memesan merchandise: ${product.name} seharga ${displayPrice}. Apakah stok masih tersedia?`;
            const rawWaOrderUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage)}`;
            const waOrderUrl = sanitizeOutboundUrl(rawWaOrderUrl) || `https://wa.me/${whatsappNumber}`;

            return (
              <AnimateReveal
                key={product.id || index}
                variant="fade-up"
                delayMs={index * 130}
                durationMs={700}
              >
                <div className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_#000000] flex flex-col md:flex-row hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 transition-all h-full">
                  {/* Product Visual Mock (Fixed Aspect Ratio Container) */}
                  <div className="md:w-60 h-64 md:h-auto aspect-square bg-[#FFF8F6] border-b-4 md:border-b-0 md:border-r-4 border-black p-4 flex flex-col justify-between items-center text-center relative overflow-hidden shrink-0">
                    {/* Custom Product Image Layer */}
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

                    {/* Top Badges */}
                    <div className="flex flex-col gap-1 self-start z-10 relative">
                      <span className="px-2 py-0.5 bg-black text-white font-['Space_Mono',monospace] text-[10px] font-bold uppercase tracking-wider">
                        {product.badge || "OFFICIAL"}
                      </span>
                      {productStock !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 font-['Space_Mono',monospace] text-[9px] font-bold border border-black uppercase ${
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
                            : `Stok: ${productStock} pcs`}
                        </span>
                      )}
                    </div>

                    {/* Default Mock typography */}
                    {!hasCustomImage && (
                      <div className="my-auto z-10 relative">
                        <span className="font-['Anton',sans-serif] text-3xl text-[#281812] uppercase block">
                          TIMIKA
                        </span>
                        <span className="font-['Space_Mono',monospace] text-xs text-[#A83300] font-bold uppercase block mt-1">
                          OFFICIAL
                        </span>
                      </div>
                    )}

                    <span className="font-['Space_Mono',monospace] text-[10px] text-[#5C4037] uppercase z-10 relative">
                      LIMITED RUN
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 p-6 flex flex-col justify-between gap-6">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-['Anton',sans-serif] text-2xl md:text-3xl text-[#281812] uppercase tracking-wide">
                          {product.name}
                        </h3>
                        <span className="px-3 py-1 bg-[#10B981] text-black font-['Space_Mono',monospace] text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000000] whitespace-nowrap">
                          {displayPrice}
                        </span>
                      </div>

                      <p className="font-['Work_Sans',sans-serif] text-sm md:text-base text-[#5C4037] mt-3 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {isComingSoon ? (
                        <div className="flex-1 w-full py-3 bg-[#DC2626] text-white font-['Space_Mono',monospace] text-xs font-black tracking-wider uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000000] rotate-[-2deg] select-none cursor-not-allowed text-center">
                          COMING SOON
                        </div>
                      ) : isOutOfStock ? (
                        <div className="flex-1 w-full py-3 bg-zinc-800 text-white font-['Space_Mono',monospace] text-xs font-black tracking-wider uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000000] rotate-[-2deg] select-none cursor-not-allowed text-center">
                          SOLD OUT
                        </div>
                      ) : (
                        <a
                          href={waOrderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 w-full py-3 bg-[#10B981] hover:bg-emerald-400 text-black font-['Space_Mono',monospace] text-xs font-bold tracking-wider uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4 text-black" />
                          <span>ORDER WA</span>
                        </a>
                      )}

                      <Link
                        href="/store"
                        className="group flex-1 w-full py-3 bg-black hover:bg-white text-white hover:text-black font-['Space_Mono',monospace] text-xs font-bold tracking-wider uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] transition-all text-center block"
                      >
                        <span className="text-white group-hover:text-black transition-colors">
                          VIEW STORE
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </AnimateReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
