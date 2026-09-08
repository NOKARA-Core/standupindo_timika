"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Check,
  Copy,
  Trash2,
  Sliders,
  Sparkles,
  Info,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Layers,
} from "lucide-react";
import {
  SiteAssetsConfig,
  defaultSiteConfig,
} from "../../src/lib/site-config";
import {
  initialMediaAssets,
  MediaAsset,
  uploadAsset,
} from "../../src/lib/mock-data";

export default function MediaAssetsAdminPage() {
  const [siteConfig, setSiteConfig] = useState<SiteAssetsConfig>(defaultSiteConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Storage explorer state
  const [assets, setAssets] = useState<MediaAsset[]>(initialMediaAssets);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  // Client helper for uploading to /api/upload (Cloudinary / Local Provider)
  const uploadFileToServer = async (
    file: File,
    folder: string = "stup-timika"
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || "Gagal mengunggah file ke Cloudinary storage"
      );
    }

    const data = await res.json();
    return {
      url: data.url as string,
      publicId: data.publicId as string,
      size: data.size || `${(file.size / 1024).toFixed(1)} KB`,
      name: file.name,
    };
  };

  // Load configuration from API on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/site-config");
        if (res.ok) {
          const data = await res.json();
          setSiteConfig(data);
        }
      } catch (err) {
        console.warn("Using default fallback site config:", err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const persistConfig = async (newConfig: SiteAssetsConfig) => {
    setSiteConfig(newConfig);
    setSaving(true);
    try {
      const res = await fetch("/api/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save config:", err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Global Dynamic vs Static
  const handleToggleDynamic = () => {
    const updated: SiteAssetsConfig = {
      ...siteConfig,
      useDynamicAssets: !siteConfig.useDynamicAssets,
    };
    persistConfig(updated);
  };

  // Reset entire slot or individual items
  const handleResetHero = () => {
    const updated: SiteAssetsConfig = {
      ...siteConfig,
      hero: {
        ...defaultSiteConfig.hero,
      },
    };
    persistConfig(updated);
  };

  const handleResetComedian = (id: string) => {
    const updated: SiteAssetsConfig = {
      ...siteConfig,
      comedians: siteConfig.comedians.map((c) =>
        c.id === id ? { ...c, avatarUrl: null, isCustom: false } : c
      ),
    };
    persistConfig(updated);
  };

  const handleResetFlyer = (id: string) => {
    const updated: SiteAssetsConfig = {
      ...siteConfig,
      flyers: siteConfig.flyers.map((f) =>
        f.id === id ? { ...f, flyerUrl: null, isCustom: false } : f
      ),
    };
    persistConfig(updated);
  };

  const handleResetMerch = (id: string) => {
    const updated: SiteAssetsConfig = {
      ...siteConfig,
      merch: siteConfig.merch.map((m) =>
        m.id === id ? { ...m, imageUrl: null, isCustom: false } : m
      ),
    };
    persistConfig(updated);
  };

  // Upload handler for Hero Visual
  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingSlot("hero");
      try {
        const uploaded = await uploadFileToServer(file, "stup-timika/hero");
        const updated: SiteAssetsConfig = {
          ...siteConfig,
          hero: {
            ...siteConfig.hero,
            url: uploaded.url,
            isCustom: true,
          },
        };
        await persistConfig(updated);

        // Also register to media explorer
        setAssets((prev) => [
          {
            id: `med-${Date.now()}`,
            name: file.name,
            type: "BANNER",
            size: uploaded.size,
            url: uploaded.url,
            uploadedAt: new Date().toISOString().split("T")[0] || "2026-10-01",
          },
          ...prev,
        ]);
      } catch (err: any) {
        alert(err.message || "Gagal mengunggah foto hero");
      } finally {
        setUploadingSlot(null);
      }
    }
  };

  // Upload handler for Comedian
  const handleComedianUpload = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingSlot(`comedian-${id}`);
      try {
        const uploaded = await uploadFileToServer(file, "stup-timika/comedians");
        const updated: SiteAssetsConfig = {
          ...siteConfig,
          comedians: siteConfig.comedians.map((c) =>
            c.id === id ? { ...c, avatarUrl: uploaded.url, isCustom: true } : c
          ),
        };
        await persistConfig(updated);

        setAssets((prev) => [
          {
            id: `med-${Date.now()}`,
            name: file.name,
            type: "HEADSHOT",
            size: uploaded.size,
            url: uploaded.url,
            uploadedAt: new Date().toISOString().split("T")[0] || "2026-10-01",
          },
          ...prev,
        ]);
      } catch (err: any) {
        alert(err.message || "Gagal mengunggah foto komika");
      } finally {
        setUploadingSlot(null);
      }
    }
  };

  // Upload handler for Flyer
  const handleFlyerUpload = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingSlot(`flyer-${id}`);
      try {
        const uploaded = await uploadFileToServer(file, "stup-timika/flyers");
        const updated: SiteAssetsConfig = {
          ...siteConfig,
          flyers: siteConfig.flyers.map((f) =>
            f.id === id ? { ...f, flyerUrl: uploaded.url, isCustom: true } : f
          ),
        };
        await persistConfig(updated);

        setAssets((prev) => [
          {
            id: `med-${Date.now()}`,
            name: file.name,
            type: "FLYER",
            size: uploaded.size,
            url: uploaded.url,
            uploadedAt: new Date().toISOString().split("T")[0] || "2026-10-01",
          },
          ...prev,
        ]);
      } catch (err: any) {
        alert(err.message || "Gagal mengunggah flyer event");
      } finally {
        setUploadingSlot(null);
      }
    }
  };

  // Upload handler for Merch
  const handleMerchUpload = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingSlot(`merch-${id}`);
      try {
        const uploaded = await uploadFileToServer(file, "stup-timika/merch");
        const updated: SiteAssetsConfig = {
          ...siteConfig,
          merch: siteConfig.merch.map((m) =>
            m.id === id ? { ...m, imageUrl: uploaded.url, isCustom: true } : m
          ),
        };
        await persistConfig(updated);

        setAssets((prev) => [
          {
            id: `med-${Date.now()}`,
            name: file.name,
            type: "DOCUMENTATION",
            size: uploaded.size,
            url: uploaded.url,
            uploadedAt: new Date().toISOString().split("T")[0] || "2026-10-01",
          },
          ...prev,
        ]);
      } catch (err: any) {
        alert(err.message || "Gagal mengunggah foto produk merch");
      } finally {
        setUploadingSlot(null);
      }
    }
  };

  // General explorer file upload handler
  const handleGeneralUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingSlot("general");
      try {
        const uploaded = await uploadFileToServer(file, "stup-timika/general");
        setAssets((prev) => [
          {
            id: `med-${Date.now()}`,
            name: file.name,
            type: file.name.includes("headshot")
              ? "HEADSHOT"
              : file.name.includes("flyer")
              ? "FLYER"
              : "BANNER",
            size: uploaded.size,
            url: uploaded.url,
            uploadedAt: new Date().toISOString().split("T")[0] || "2026-10-01",
          },
          ...prev,
        ]);
      } catch (err: any) {
        alert(err.message || "Gagal mengunggah file ke storage");
      } finally {
        setUploadingSlot(null);
      }
    }
  };

  // Generic explorer helpers
  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus aset media ini dari storage?")) {
      setAssets((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const filteredAssets = assets.filter(
    (a) => selectedType === "ALL" || a.type === selectedType
  );

  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:5000";

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">
              Media & Dynamic Asset Control
            </h1>
            {saveSuccess && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full animate-fade-in">
                <Check className="w-3 h-3" /> Tersimpan ke Database
              </span>
            )}
            {saving && (
              <span className="text-[11px] text-gray-500 font-medium animate-pulse">
                Menyimpan...
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manajemen aset dinamis landing page publik dengan sistem perlindungan fallback statis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={webUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors shadow-xs"
          >
            <span>Preview Landing Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>
        </div>
      </div>

      {/* 2. Global Sync Toggle Banner (Neo-Brutalist Toggle Card) */}
      <div
        className={`border-2 border-black p-6 transition-all shadow-[6px_6px_0px_0px_#000000] ${
          siteConfig.useDynamicAssets
            ? "bg-[#FFF8F6] border-black"
            : "bg-white border-gray-300 shadow-[4px_4px_0px_0px_#D1D5DB]"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 flex items-center justify-center border-2 border-black shrink-0 ${
                siteConfig.useDynamicAssets
                  ? "bg-[#FF4500] text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <Sliders className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-gray-900 tracking-tight">
                  Override Landing Page with Uploaded Assets
                </h2>
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border ${
                    siteConfig.useDynamicAssets
                      ? "bg-emerald-600 text-white border-black"
                      : "bg-gray-200 text-gray-700 border-gray-400"
                  }`}
                >
                  {siteConfig.useDynamicAssets
                    ? "DYNAMIC MODE ACTIVE"
                    : "STATIC FALLBACK ONLY"}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                {siteConfig.useDynamicAssets
                  ? "Aset hasil upload di bawah ini sedang aktif menimpa tampilan grafis landing page (port 5000). Jika ada slot aset yang kosong, sistem otomatis memakai fallback bawaan."
                  : "Mode Statis Aktif: Landing page saat ini mengunci tampilan pada aset desain bawaan asli. Upload yang Anda simpan di bawah tidak akan memengaruhi landing page sampai toggle ini diaktifkan."}
              </p>
            </div>
          </div>

          {/* Toggle Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleToggleDynamic}
              className={`px-5 py-3 border-2 border-black font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                siteConfig.useDynamicAssets
                  ? "bg-black text-white hover:bg-[#FF4500] shadow-[3px_3px_0px_0px_#FF4500] active:translate-x-[2px] active:translate-y-[2px]"
                  : "bg-white text-black hover:bg-gray-100 shadow-[3px_3px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px]"
              }`}
            >
              {siteConfig.useDynamicAssets
                ? "NONAKTIFKAN (Gunakan Statis)"
                : "AKTIFKAN ASET DINAMIS"}
            </button>
          </div>
        </div>
      </div>

      {/* 3. ASSET SPECIFICATIONS & SCALE GUIDE (Card Information) */}
      <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-black">
          <Info className="w-5 h-5 text-[#FF4500]" />
          <h2 className="font-['Space_Mono',monospace] text-sm font-bold uppercase tracking-wider text-gray-900">
            ASSET SPECIFICATIONS & SCALE GUIDE
          </h2>
          <span className="text-[11px] font-semibold text-gray-500 ml-auto hidden sm:inline-block">
            Standard Rasio Desain Neo-Brutalism
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Guide 1: Hero Stage Visual */}
          <div className="bg-gray-50 border border-gray-200 p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">
                  1. Hero Stage Visual
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-black text-white">
                  1:1 / 4:5
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                Foto panggung megah atau visual utama hero section.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-200 text-[10px] text-gray-500 font-mono space-y-0.5">
              <div>• Rekomendasi: 1080 × 1080 px (min. 548 × 500 px)</div>
              <div>• Format: WebP / PNG (Max 2 MB)</div>
            </div>
          </div>

          {/* Guide 2: Comedian Headshot */}
          <div className="bg-gray-50 border border-gray-200 p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">
                  2. Comedian Headshot
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#FF4500] text-white">
                  1:1 Square
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                Foto profil komika roster untuk card Lineup.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-200 text-[10px] text-gray-500 font-mono space-y-0.5">
              <div>• Rekomendasi: 800 × 800 px</div>
              <div>• Style: Close-up / Mid-shot Grayscale (Max 1 MB)</div>
            </div>
          </div>

          {/* Guide 3: Event Flyer */}
          <div className="bg-gray-50 border border-gray-200 p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">
                  3. Event Flyer
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-black text-white">
                  4:5 Portrait
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                Poster acara open mic dan show berbayar TapTap.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-200 text-[10px] text-gray-500 font-mono space-y-0.5">
              <div>• Rekomendasi: 1080 × 1350 px</div>
              <div>• Format: JPG / PNG (Max 2 MB)</div>
            </div>
          </div>

          {/* Guide 4: Merch Product */}
          <div className="bg-gray-50 border border-gray-200 p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">
                  4. Merch Product
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#FF4500] text-white">
                  1:1 Square
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                Foto produk kaos official, mug, dan merchandise.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-200 text-[10px] text-gray-500 font-mono space-y-0.5">
              <div>• Rekomendasi: 800 × 800 px</div>
              <div>• Latar: Putih / Transparan PNG (Max 1 MB)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FOUR DEDICATED UPLOAD SLOTS */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-gray-700" />
          <h2 className="text-base font-bold text-gray-900">
            Dedicated Landing Page Asset Slots
          </h2>
        </div>

        {/* Slot 1: Hero Stage Visual */}
        <div className="bg-white border border-gray-200 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Slot 1: Hero Stage Visual
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Visual utama hero kanan di halaman depan (Home). Mengisi frame cetakan tanpa distorsi.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {siteConfig.hero.isCustom && (
                <button
                  type="button"
                  onClick={handleResetHero}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xs transition-colors cursor-pointer"
                  title="Kembalikan ke tampilan grafis tipografi bawaan"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Default</span>
                </button>
              )}

              <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Hero</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleHeroUpload}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-center">
            {/* Live Visual Preview Frame */}
            <div className="md:col-span-6 lg:col-span-5">
              <div className="w-full max-w-[340px] aspect-[4/3] bg-[#FFF8F6] border-2 border-black shadow-[6px_6px_0px_0px_#000000] relative overflow-hidden flex flex-col justify-between p-4 mx-auto md:mx-0">
                {siteConfig.hero.url ? (
                  <>
                    <Image
                      src={siteConfig.hero.url}
                      alt="Hero Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                    <div className="relative z-10 flex justify-between">
                      <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono font-bold">
                        CUSTOM UPLOAD
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono font-bold">
                        {siteConfig.hero.tag}
                      </span>
                      <span className="px-2 py-0.5 bg-[#FF4500] text-white text-[10px] font-mono font-bold">
                        {siteConfig.hero.subtag}
                      </span>
                    </div>

                    <div className="my-auto text-center border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_#000000]">
                      <span className="font-bold text-lg text-gray-900 uppercase block">
                        {siteConfig.hero.title}
                      </span>
                      <span className="font-bold text-sm text-[#FF4500] uppercase block">
                        {siteConfig.hero.subtitle}
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-gray-500 text-center">
                      (Tampilan Bawaan Tipografi Statis)
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Status explanation */}
            <div className="md:col-span-6 lg:col-span-7 space-y-3 text-xs text-gray-600">
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <span>Status Saat Ini:</span>
                {siteConfig.hero.isCustom ? (
                  <span className="text-orange-600 font-bold bg-orange-50 px-2 py-0.5 border border-orange-200">
                    Menggunakan Foto Upload Kustom
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    Tampilan Bawaan Statis (Typographic Card)
                  </span>
                )}
              </div>
              <p className="leading-relaxed">
                Di landing page publik, gambar ini dibungkus kontainer fixed aspect ratio berbingkai hitam tebal (<code className="bg-gray-100 px-1 py-0.5 text-gray-800">border-4 border-black</code>) dengan hard drop shadow. Rasio 1:1 atau 4:5 sangat disarankan agar panggung tidak terpotong.
              </p>
            </div>
          </div>
        </div>

        {/* Slot 2: Comedians / Lineup Headshots */}
        <div className="bg-white border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Slot 2: Comedians / Lineup Headshots
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Foto headshot komika roster pada seksi THE LINEUP (Rasio 1:1 Square, auto grayscale filter).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {siteConfig.comedians.map((c) => (
              <div
                key={c.id}
                className="border border-gray-200 p-4 bg-gray-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="font-bold text-xs text-gray-900">
                      {c.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-black text-white">
                      {c.badge}
                    </span>
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="mt-3 aspect-square bg-white border border-gray-300 relative overflow-hidden flex items-center justify-center">
                    {c.avatarUrl ? (
                      <Image
                        src={c.avatarUrl}
                        alt={c.name}
                        fill
                        className="object-cover filter grayscale contrast-125"
                      />
                    ) : (
                      <div className="text-center p-3">
                        <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                        <span className="text-[11px] text-gray-400 font-mono block">
                          Card Bawaan
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between gap-2">
                  {c.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleResetComedian(c.id)}
                      className="text-[11px] text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}

                  <label className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-semibold transition-colors cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>Upload Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleComedianUpload(c.id, e)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slot 3: Upcoming Show Flyers */}
        <div className="bg-white border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Slot 3: Upcoming Show Flyers
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Poster flyer pertunjukan panggung TapTap (Rasio 4:5 Portrait).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {siteConfig.flyers.map((f) => (
              <div
                key={f.id}
                className="border border-gray-200 p-4 bg-gray-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="font-bold text-xs text-gray-900">
                      {f.title}
                    </span>
                    <span className="text-[10px] text-gray-500">{f.venue}</span>
                  </div>

                  <div className="mt-3 aspect-[4/5] max-h-[220px] bg-white border border-gray-300 relative overflow-hidden flex items-center justify-center mx-auto w-full">
                    {f.flyerUrl ? (
                      <Image
                        src={f.flyerUrl}
                        alt={f.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-center p-3">
                        <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                        <span className="text-[11px] text-gray-400 font-mono block">
                          Format Text Jadwal Bawaan
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between gap-2">
                  {f.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleResetFlyer(f.id)}
                      className="text-[11px] text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}

                  <label className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-semibold transition-colors cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>Upload Flyer</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFlyerUpload(f.id, e)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slot 4: Store Merchandise Items */}
        <div className="bg-white border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Slot 4: Store Merchandise Items
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Visual produk merch official (Rasio 1:1 Square, latar bersih/transparan).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {siteConfig.merch.map((m) => (
              <div
                key={m.id}
                className="border border-gray-200 p-4 bg-gray-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="font-bold text-xs text-gray-900">
                      {m.name}
                    </span>
                    <span className="text-[11px] font-bold text-orange-600">
                      {m.price}
                    </span>
                  </div>

                  <div className="mt-3 aspect-square max-h-[180px] bg-white border border-gray-300 relative overflow-hidden flex items-center justify-center mx-auto w-full">
                    {m.imageUrl ? (
                      <Image
                        src={m.imageUrl}
                        alt={m.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="text-center p-3">
                        <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                        <span className="text-[11px] text-gray-400 font-mono block">
                          Mock Box Tipografi Bawaan
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between gap-2">
                  {m.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleResetMerch(m.id)}
                      className="text-[11px] text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}

                  <label className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-semibold transition-colors cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>Upload Foto Produk</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleMerchUpload(m.id, e)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. General Media & Asset Storage Explorer */}
      <div className="pt-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Media Asset Storage Explorer
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Daftar seluruh file yang telah terunggah di media repository
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {["ALL", "BANNER", "FLYER", "HEADSHOT", "DOCUMENTATION"].map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    selectedType === type
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  {type}
                </button>
              )
            )}
          </div>
        </div>

        {/* Media Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white border border-gray-200 shadow-xs flex flex-col justify-between overflow-hidden group hover:border-gray-400 transition-all"
            >
              <div className="h-36 bg-gray-900 flex flex-col justify-between p-3 relative overflow-hidden">
                <div className="flex justify-between items-start z-10">
                  <span className="px-2 py-0.5 bg-white/90 text-gray-900 text-[10px] font-bold uppercase tracking-wider">
                    {asset.type}
                  </span>
                  <span className="text-[10px] text-white/70 font-mono">
                    {asset.size}
                  </span>
                </div>

                <div className="my-auto text-center z-10">
                  <ImageIcon className="w-6 h-6 text-white/40 mx-auto mb-1" />
                  <span className="text-[11px] text-white font-mono block px-2 truncate">
                    {asset.name}
                  </span>
                </div>

                <div className="text-[10px] text-white/50 z-10">
                  Uploaded: {asset.uploadedAt}
                </div>
              </div>

              <div className="p-2.5 bg-white border-t border-gray-200 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(asset.id, asset.url)}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
                >
                  {copiedId === asset.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">
                        Copied!
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(asset.id)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Hapus Aset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
