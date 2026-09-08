"use client";

import { useState } from "react";
import { Navbar } from "../../src/components/Navbar";
import { Footer } from "../../src/components/Footer";
import { Search, UserCheck } from "lucide-react";

interface Comedian {
  id: string;
  name: string;
  category: "Observational" | "Storytelling" | "Dark Comedy" | "Absurd";
  punchline: string;
  bio: string;
  badgeColor: string;
  showsCount: number;
}

const comediansData: Comedian[] = [
  {
    id: "dimas",
    name: "DIMAS",
    category: "Observational",
    punchline: "Master of awkward silences and brutal observations about Timika traffic.",
    bio: "Membawa keresahan hidup anak perantau di pelosok Papua dengan gaya deadpan dingin tanpa ekspresi.",
    badgeColor: "bg-black text-white",
    showsCount: 24,
  },
  {
    id: "tika",
    name: "TIKA",
    category: "Storytelling",
    punchline: "Rapid-fire punchlines dissecting modern relationships and local cafe culture.",
    bio: "Pencerita ulung yang membongkar realita pacaran dan obrolan tongkrongan Timika yang relatable.",
    badgeColor: "bg-[#FF4500] text-white",
    showsCount: 31,
  },
  {
    id: "rian",
    name: "RIAN",
    category: "Dark Comedy",
    punchline: "No one is safe. If you sit in the front row, you're part of the set.",
    bio: "Raja roast battle Timika dengan punchline tajam yang menguji mental penonton baris depan.",
    badgeColor: "bg-[#A83300] text-white",
    showsCount: 42,
  },
  {
    id: "yosua",
    name: "YOSUA",
    category: "Absurd",
    punchline: "Logika terbalik dan premis tak terduga yang bikin mikir dua kali.",
    bio: "Eksplorasi humor surealis dan analogi absurd yang membengkokkan akal sehat dengan tawa renyah.",
    badgeColor: "bg-[#281812] text-white",
    showsCount: 18,
  },
  {
    id: "budi-k",
    name: "BUDI K.",
    category: "Observational",
    punchline: "Menertawakan birokrasi dan harga tiket pesawat pedalaman Papua.",
    bio: "Spesialis komedi keresahan harian, harga sembako, dan perjuangan sinyal di pelosok Mimika.",
    badgeColor: "bg-black text-white",
    showsCount: 29,
  },
  {
    id: "samuel",
    name: "SAMUEL",
    category: "Storytelling",
    punchline: "Kisah nyata masa kecil pesisir dengan tempo lambat tapi meledak.",
    bio: "Menghadirkan nostalgia kampung halaman dan kehangatan tawa khas Indonesia Timur yang otentik.",
    badgeColor: "bg-[#FF4500] text-white",
    showsCount: 20,
  },
];

const categories = ["All", "Observational", "Storytelling", "Dark Comedy", "Absurd"] as const;

export default function TalentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredComedians = comediansData.filter((comedian) => {
    const matchesCategory =
      selectedCategory === "All" || comedian.category === selectedCategory;
    const matchesSearch =
      comedian.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comedian.punchline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comedian.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-[#FF4500] selection:text-white">
      <Navbar />

      <main className="flex-1 py-16 px-6 md:px-12 lg:px-20 max-w-[1280px] mx-auto w-full">
        {/* Page Header */}
        <div className="border-b-4 border-black pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-block px-3 py-1 bg-black text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-widest mb-3">
              ROSTER TIMIKA
            </div>
            <h1 className="font-['Anton',sans-serif] text-5xl md:text-7xl text-[#281812] uppercase tracking-tight">
              THE LINEUP
            </h1>
            <p className="font-['Work_Sans',sans-serif] text-lg text-[#5C4037] mt-2 max-w-xl">
              Komika underground Timika siap mengguncang panggung dengan set materi tanpa sensor dan punchline tajam.
            </p>
          </div>

          <div className="flex items-center gap-2 font-['Space_Mono',monospace] text-sm font-bold bg-white border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_#000000]">
            <UserCheck className="w-5 h-5 text-[#FF4500]" />
            <span>{filteredComedians.length} ROSTER READY</span>
          </div>
        </div>

        {/* Filter Bar & Search Input */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 mb-12">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 font-['Space_Mono',monospace] text-xs md:text-sm font-bold uppercase tracking-wider border-2 border-black cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? "bg-[#FF4500] text-white shadow-[4px_4px_0px_0px_#000000] translate-x-0.5 translate-y-0.5"
                    : "bg-white text-[#281812] shadow-[4px_4px_0px_0px_#000000] hover:bg-[#FFE9E3]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <input
              type="text"
              placeholder="SEARCH TALENT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-black px-4 py-2.5 pl-10 font-['Space_Mono',monospace] text-sm text-[#281812] placeholder-[#5C4037] rounded-none focus:outline-none focus:ring-2 focus:ring-[#FF4500] shadow-[4px_4px_0px_0px_#000000]"
            />
            <Search className="w-4 h-4 text-[#281812] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Talent Grid */}
        {filteredComedians.length === 0 ? (
          <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_#000000]">
            <span className="font-['Anton',sans-serif] text-3xl text-[#281812] uppercase block">
              NO TALENT FOUND
            </span>
            <p className="font-['Space_Mono',monospace] text-sm text-[#5C4037] mt-2">
              Coba cari dengan kata kunci lain atau reset filter kategori.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredComedians.map((comedian) => (
              <article
                key={comedian.id}
                className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000000] flex flex-col justify-between"
              >
                {/* Visual Card Header (Grayscale Photo Representation) */}
                <div className="h-64 bg-[#281812] border-b-2 border-black p-4 flex flex-col justify-between relative overflow-hidden grayscale">
                  {/* Decorative background grid pattern */}
                  <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:20px_20px]" />

                  <div className="relative z-10 flex justify-between items-start">
                    <span
                      className={`px-3 py-1 font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-wider border border-black ${comedian.badgeColor}`}
                    >
                      {comedian.category}
                    </span>
                    <span className="font-['Space_Mono',monospace] text-xs font-bold text-white bg-black/60 px-2 py-0.5 border border-white/20">
                      {comedian.showsCount} SHOWS
                    </span>
                  </div>

                  <div className="relative z-10 text-center my-auto">
                    <span className="font-['Anton',sans-serif] text-6xl text-white tracking-widest uppercase opacity-30 select-none block">
                      STANDUP
                    </span>
                    <span className="font-['Anton',sans-serif] text-3xl text-white tracking-wider uppercase block mt-[-10px]">
                      {comedian.name}
                    </span>
                  </div>

                  <div className="relative z-10 flex justify-between items-center font-['Space_Mono',monospace] text-[10px] text-white/60 uppercase">
                    <span>TIMIKA CHAPTER</span>
                    <span>ACTIVE ROSTER</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col justify-between flex-1 gap-6">
                  <div>
                    <h2 className="font-['Anton',sans-serif] text-3xl text-[#281812] uppercase tracking-wide">
                      {comedian.name}
                    </h2>
                    <p className="font-['Work_Sans',sans-serif] font-medium text-sm text-[#281812] mt-1 italic border-l-2 border-[#FF4500] pl-2">
                      &quot;{comedian.punchline}&quot;
                    </p>
                    <p className="font-['Work_Sans',sans-serif] text-sm text-[#5C4037] mt-3 leading-relaxed">
                      {comedian.bio}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    type="button"
                    className="w-full py-3 bg-[#FF4500] hover:bg-[#e03d00] text-white font-['Space_Mono',monospace] text-sm font-bold tracking-wider uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    BOOK NOW
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
