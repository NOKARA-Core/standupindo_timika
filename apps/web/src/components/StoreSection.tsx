import Link from "next/link";
import { ShoppingBag } from "lucide-react";

interface Product {
  name: string;
  price: string;
  description: string;
  badge: string;
}

const products: Product[] = [
  {
    name: "'LIVE RAW' TEE",
    price: "Rp 150k",
    description:
      "Heavyweight cotton. Wash cold. Don't iron the print. Wear it to a gig.",
    badge: "HEAVYWEIGHT 24S",
  },
  {
    name: "BITTER MUG",
    price: "Rp 80k",
    description:
      "Holds 12oz of black coffee. Or whatever liquid gets you through the set.",
    badge: "CERAMIC 12OZ",
  },
];

export function StoreSection() {
  return (
    <section
      id="store"
      className="w-full bg-[#FDFBF7] py-16 px-6 md:px-12 lg:px-20 border-b-2 border-black"
    >
      <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
        {/* Section Heading */}
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

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product, index) => (
            <div
              key={index}
              className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000000] flex flex-col md:flex-row"
            >
              {/* Product Visual Mock */}
              <div className="md:w-56 h-60 md:h-auto bg-[#FFF8F6] border-b-2 md:border-b-0 md:border-r-2 border-black p-6 flex flex-col justify-between items-center text-center">
                <span className="px-2 py-0.5 bg-black text-white font-['Space_Mono',monospace] text-[10px] font-bold uppercase tracking-wider self-start">
                  {product.badge}
                </span>

                <div className="my-auto">
                  <span className="font-['Anton',sans-serif] text-3xl text-[#281812] uppercase block">
                    TIMIKA
                  </span>
                  <span className="font-['Space_Mono',monospace] text-xs text-[#A83300] font-bold uppercase block mt-1">
                    OFFICIAL
                  </span>
                </div>

                <span className="font-['Space_Mono',monospace] text-[10px] text-[#5C4037] uppercase">
                  LIMITED RUN
                </span>
              </div>

              {/* Product Details */}
              <div className="flex-1 p-6 flex flex-col justify-between gap-6">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-['Anton',sans-serif] text-3xl text-[#281812] uppercase tracking-wide">
                      {product.name}
                    </h3>
                    <span className="px-3 py-1 bg-[#A83300] text-white font-['Space_Mono',monospace] text-sm font-bold border border-black shadow-[2px_2px_0px_0px_#000000] whitespace-nowrap">
                      {product.price}
                    </span>
                  </div>

                  <p className="font-['Work_Sans',sans-serif] text-base text-[#5C4037] mt-3 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <Link
                  href="/store"
                  className="w-full py-3 bg-black hover:bg-[#281812] text-white font-['Space_Mono',monospace] text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-center block"
                >
                  VIEW ON STORE
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
