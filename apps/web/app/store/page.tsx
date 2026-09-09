"use client";

import { useState } from "react";
import { Navbar } from "../../src/components/Navbar";
import { Footer } from "../../src/components/Footer";
import { AnimateReveal } from "../../src/components/AnimateReveal";
import { ShoppingBag, Check } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: "APPAREL" | "ACCESSORIES" | "TICKETS PRE-ORDER";
  price: string;
  rawPrice: number;
  description: string;
  badge: string;
  status: "IN STOCK" | "PRE-ORDER" | "LIMITED";
}

const storeProducts: Product[] = [
  {
    id: "tee-liveraw",
    name: "'LIVE RAW' HEAVYWEIGHT TEE",
    category: "APPAREL",
    price: "Rp 150.000",
    rawPrice: 150000,
    description: "Cotton Combed 24s Heavyweight, sablon plastisol doff kasar tahan banting. Cuttingan boxy fit underground.",
    badge: "BESTSELLER",
    status: "IN STOCK",
  },
  {
    id: "hoodie-underground",
    name: "TIMIKA CHAPTER HEAVY HOODIE",
    category: "APPAREL",
    price: "Rp 320.000",
    rawPrice: 320000,
    description: "Fleece 330gsm tebal cocok untuk hawa dingin malam Mimika. Grafis bordir punchline di dada dan punggung.",
    badge: "LIMITED EDITION",
    status: "LIMITED",
  },
  {
    id: "mug-bitter",
    name: "THE BITTER COMEDIAN MUG",
    category: "ACCESSORIES",
    price: "Rp 80.000",
    rawPrice: 80000,
    description: "Keramik hitam doff 12oz. Menampung kopi pahit untuk menemani kamu nulis premis sampai subuh.",
    badge: "OFFICIAL MERCH",
    status: "IN STOCK",
  },
  {
    id: "sticker-pack",
    name: "STANDUP TIMIKA STICKER PACK (10 PCS)",
    category: "ACCESSORIES",
    price: "Rp 35.000",
    rawPrice: 35000,
    description: "Vinyl waterproof die-cut tebal. Desain quote komika, logo retro, dan lambang petir komedi lokal.",
    badge: "PACK",
    status: "IN STOCK",
  },
  {
    id: "ticket-special-preorder",
    name: "PRE-ORDER TICKET: STANDUP FEST MIMIKA",
    category: "TICKETS PRE-ORDER",
    price: "Rp 100.000",
    rawPrice: 100000,
    description: "Akses VIP Presale + Merchandise bundle wristband eksklusif StandUp Festival Mimika akhir tahun.",
    badge: "EARLY ACCESS",
    status: "PRE-ORDER",
  },
  {
    id: "tote-canvas",
    name: "RAW PUNCHLINE CANVAS TOTE",
    category: "ACCESSORIES",
    price: "Rp 65.000",
    rawPrice: 65000,
    description: "Kanvas tebal 14oz berresleting. Kuat bawa laptop dan buku catatan materi stand-up.",
    badge: "NEW ARRIVAL",
    status: "IN STOCK",
  },
];

export default function StorePage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [cartCount, setCartCount] = useState<number>(0);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const filteredProducts = storeProducts.filter((p) => {
    if (selectedFilter === "ALL") return true;
    return p.category === selectedFilter;
  });

  const handleAddToCart = (name: string) => {
    setCartCount((prev) => prev + 1);
    setLastAdded(name);
    setTimeout(() => setLastAdded(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-[#FF4500] selection:text-white">
      <Navbar />

      <main className="flex-1 py-16 px-6 md:px-12 lg:px-20 max-w-[1280px] mx-auto w-full">
        {/* Header Section */}
        <AnimateReveal variant="slide-left" durationMs={650}>
          <div className="border-b-4 border-black pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-block px-3 py-1 bg-black text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-widest mb-3">
                OFFICIAL GEAR
              </div>
              <h1 className="font-['Anton',sans-serif] text-5xl md:text-7xl text-[#281812] uppercase tracking-tight">
                THE STORE
              </h1>
              <p className="font-['Work_Sans',sans-serif] text-lg text-[#5C4037] mt-2 max-w-xl">
                Dukung pergerakan stand-up underground Timika lewat merchandise resmi, apparel, dan tiket pre-order.
              </p>
            </div>

            {/* Cart Status Indicator */}
            <div className="flex items-center gap-3 bg-white border-4 border-black px-6 py-3 shadow-[6px_6px_0px_0px_#000000]">
              <ShoppingBag className="w-6 h-6 text-[#FF4500]" />
              <span className="font-['Space_Mono',monospace] text-sm font-bold uppercase tracking-wider">
                CART ({cartCount} ITEMS)
              </span>
            </div>
          </div>
        </AnimateReveal>

        {/* Filter Pills */}
        <AnimateReveal variant="fade-up" delayMs={80} durationMs={650}>
          <div className="flex flex-wrap gap-2 mb-10">
            {(["ALL", "APPAREL", "ACCESSORIES", "TICKETS PRE-ORDER"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedFilter(filter)}
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

        {/* Products Grid with Entrance Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <AnimateReveal
              key={product.id}
              variant="fade-up"
              delayMs={index * 85}
              durationMs={650}
            >
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-full">
                {/* Product Visual Box */}
                <div className="h-60 bg-[#FFF8F6] border-b-4 border-black p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-start z-10">
                    <span className="px-2.5 py-1 bg-black text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-wider">
                      {product.badge}
                    </span>
                    <span className="px-2 py-0.5 bg-[#FFE9E3] text-[#A83300] font-['Space_Mono',monospace] text-[11px] font-bold border border-black uppercase">
                      {product.status}
                    </span>
                  </div>

                  <div className="my-auto text-center z-10">
                    <span className="font-['Anton',sans-serif] text-5xl text-[#281812] uppercase tracking-wider block opacity-20 select-none">
                      TIMIKA
                    </span>
                    <span className="font-['Anton',sans-serif] text-2xl text-[#FF4500] uppercase tracking-wide block mt-[-10px]">
                      OFFICIAL
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-['Space_Mono',monospace] text-[#5C4037] uppercase z-10">
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
                        {product.price}
                      </span>
                    </div>

                    <p className="font-['Work_Sans',sans-serif] text-sm text-[#5C4037] leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product.name)}
                      className="w-full py-3 bg-black hover:bg-[#281812] text-white font-['Space_Mono',monospace] text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>ADD TO CART</span>
                    </button>
                  </div>
                </div>
              </div>
            </AnimateReveal>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
