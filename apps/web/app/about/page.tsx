import Image from "next/image";
import { Navbar } from "../../src/components/Navbar";
import { Footer } from "../../src/components/Footer";
import { LocationSection } from "../../src/components/LocationSection";
import { AnimateReveal } from "../../src/components/AnimateReveal";
import { Mic, Flame, Shield, Target } from "lucide-react";
import { getMediaSettingsFromDB } from "../../src/lib/site-config.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AboutPageProps {
  searchParams?: Promise<{ view_mode?: string }>;
}

const bentoArchives = [
  {
    id: "doc-origin",
    title: "FIRST OPEN MIC IN MIMIKA (2018)",
    desc: "Bermula dari 5 orang berkumpul di warung kopi Jalan Yos Sudarso dengan satu mic kabel dan penonton yang bingung.",
    badge: "ORIGIN STORY",
    colSpan: "md:col-span-2",
  },
  {
    id: "doc-milestone",
    title: "100+ JAM TERTAWA",
    desc: "Lebih dari 150 kali open mic digelar di berbagai kafe dan sudut kota Timika.",
    badge: "MILESTONE",
    colSpan: "md:col-span-1",
  },
  {
    id: "doc-network",
    title: "KOLABORASI KOMIKA NASIONAL",
    desc: "Membawa nama-nama besar stand-up comedy Indonesia untuk tampil langsung menghibur masyarakat Timika.",
    badge: "NETWORK",
    colSpan: "md:col-span-1",
  },
  {
    id: "doc-movement",
    title: "REGENERASI KOMIKA PAPUA",
    desc: "Secara konsisten membina dan melahirkan bakat-bakat muda asli Timika untuk berani bersuara di panggung.",
    badge: "MOVEMENT",
    colSpan: "md:col-span-2",
  },
];

export default async function AboutPage({ searchParams }: AboutPageProps) {
  const resolvedParams = await searchParams;
  const viewMode = resolvedParams?.view_mode?.toLowerCase();
  const config = await getMediaSettingsFromDB();

  const isDynamic =
    viewMode === "dynamic"
      ? true
      : viewMode === "static"
      ? false
      : Boolean(config?.useDynamicAssets);

  const dynamicDocs = config?.flyers || config?.documentation || [];
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-[#FF4500] selection:text-white">
      <Navbar />

      <main className="flex-1 py-16 px-6 md:px-12 lg:px-20 max-w-[1280px] mx-auto w-full">
        {/* Page Header */}
        <AnimateReveal variant="slide-left" durationMs={650}>
          <div className="border-b-4 border-black pb-8 mb-12">
            <div className="inline-block px-3 py-1 bg-black text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-widest mb-3">
              ROOTS & ETHOS
            </div>
            <h1 className="font-['Anton',sans-serif] text-5xl md:text-7xl text-[#281812] uppercase tracking-tight">
              STANDUP INDO TIMIKA
            </h1>
            <p className="font-['Work_Sans',sans-serif] text-lg md:text-xl text-[#5C4037] mt-3 max-w-2xl leading-relaxed">
              Komunitas seni komedi tunggal independen di bumi Mimika. Mengubah realitas keras dan keresahan harian menjadi ledakan tawa bersama.
            </p>
          </div>
        </AnimateReveal>

        {/* History / Ethos Two-Column Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16 items-stretch">
          {/* Left: Origin Story */}
          <AnimateReveal variant="fade-up" delayMs={50} durationMs={700}>
            <div className="bg-white border-4 border-black p-8 md:p-10 shadow-[8px_8px_0px_0px_#000000] flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Flame className="w-6 h-6 text-[#FF4500]" />
                  <span className="font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-widest text-[#A83300]">
                    THE GENESIS
                  </span>
                </div>
                <h2 className="font-['Anton',sans-serif] text-3xl md:text-4xl text-[#281812] uppercase mb-4">
                  LAHIR DARI TANAH EMAS & ASPAL KERAS
                </h2>
                <p className="font-['Work_Sans',sans-serif] text-[#5C4037] leading-relaxed mb-4">
                  StandUp INDO Timika didirikan sebagai wadah ekspresi bagi siapapun yang ingin menertawakan getirnya kehidupan tanpa kepura-puraan. Di kota industri yang dinamis ini, kami percaya bahwa tawa adalah mekanisme bertahan hidup paling jujur.
                </p>
                <p className="font-['Work_Sans',sans-serif] text-[#5C4037] leading-relaxed">
                  Kami bukan sekadar tongkrongan, melainkan tempat menempa mental, merangkai keresahan sosial, dan melatih keberanian di hadapan tatapan ratusan pasang mata.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-black flex justify-between items-center font-['Space_Mono',monospace] text-xs font-bold text-[#281812]">
                <span>TIMIKA CHAPTER</span>
                <span>COMMUNITY DRIVEN</span>
              </div>
            </div>
          </AnimateReveal>

          {/* Right: Vision & Mission Cards */}
          <div className="flex flex-col gap-6 justify-between">
            <AnimateReveal variant="fade-up" delayMs={120} durationMs={650}>
              <div className="bg-[#FFE9E3] border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000000]">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-5 h-5 text-[#FF4500]" />
                  <h3 className="font-['Anton',sans-serif] text-2xl text-[#281812] uppercase">
                    VISI KAMI
                  </h3>
                </div>
                <p className="font-['Work_Sans',sans-serif] text-[#281812] leading-relaxed">
                  Menjadikan Mimika sebagai episentrum stand-up comedy di kawasan Indonesia Timur dengan melahirkan talenta komika yang otentik, kritis, dan berdaya saing nasional.
                </p>
              </div>
            </AnimateReveal>

            <AnimateReveal variant="fade-up" delayMs={180} durationMs={650}>
              <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000000]">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-[#A83300]" />
                  <h3 className="font-['Anton',sans-serif] text-2xl text-[#281812] uppercase">
                    MISI KAMI
                  </h3>
                </div>
                <ul className="font-['Work_Sans',sans-serif] text-[#5C4037] space-y-2 list-disc list-inside">
                  <li>Menyelenggarakan Open Mic mingguan yang konsisten dan inklusif.</li>
                  <li>Mengadakan kelas penulisan materi dan workshop *public speaking*.</li>
                  <li>Menciptakan ruang aman untuk merayakan humor tanpa batas kelas sosial.</li>
                </ul>
              </div>
            </AnimateReveal>
          </div>
        </section>

        {/* Bento Grid Archives Section */}
        <section className="mb-16">
          <AnimateReveal variant="slide-left" durationMs={650}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                <Mic className="w-6 h-6 text-[#FF4500]" />
              </div>
              <h2 className="font-['Anton',sans-serif] text-3xl md:text-5xl text-[#281812] uppercase tracking-wide">
                THE ARCHIVES & FOOTPRINTS
              </h2>
            </div>
          </AnimateReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bentoArchives.map((archive, index) => {
              const dynamicItem =
                dynamicDocs[index] || dynamicDocs.find((d) => d.id === archive.id);
              const photoUrl = isDynamic
                ? dynamicItem?.imageUrl || dynamicItem?.flyerUrl
                : null;

              return (
                <AnimateReveal
                  key={index}
                  variant="fade-up"
                  delayMs={index * 90}
                  durationMs={650}
                  className={archive.colSpan}
                >
                  <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000000] flex flex-col justify-between hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#000000] transition-all h-full group">
                    <div>
                      {photoUrl && (
                        <div className="mb-5 aspect-[16/9] w-full bg-black border-2 border-black relative overflow-hidden shadow-[4px_4px_0px_0px_#000]">
                          <Image
                            src={photoUrl}
                            alt={archive.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 z-10 px-2 py-0.5 bg-black text-white font-['Space_Mono',monospace] text-[9px] font-bold uppercase tracking-wider">
                            LIVE DOKUMENTASI
                          </div>
                        </div>
                      )}

                      <span className="px-3 py-1 bg-black text-white font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                        {archive.badge}
                      </span>
                      <h3 className="font-['Anton',sans-serif] text-2xl md:text-3xl text-[#281812] uppercase mb-3">
                        {archive.title}
                      </h3>
                      <p className="font-['Work_Sans',sans-serif] text-[#5C4037] leading-relaxed">
                        {archive.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t-2 border-black font-['Space_Mono',monospace] text-xs font-bold text-[#A83300] flex justify-between items-center">
                      <span>ARCHIVE REF #{index + 101}</span>
                      {photoUrl && (
                        <span className="text-[10px] text-gray-500 font-mono">16:9 HD</span>
                      )}
                    </div>
                  </div>
                </AnimateReveal>
              );
            })}
          </div>
        </section>

        {/* Embedded Location Section */}
        <AnimateReveal variant="fade-up" durationMs={700}>
          <div className="border-4 border-black shadow-[8px_8px_0px_0px_#000000]">
            <LocationSection />
          </div>
        </AnimateReveal>
      </main>

      <Footer />
    </div>
  );
}
