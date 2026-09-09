"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import {
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Check,
  Copy,
  Trash2,
  Sliders,
  Info,
  ExternalLink,
  Layers,
  Loader2,
  X,
  AlertTriangle,
  Eye,
} from "lucide-react";
import {
  SiteAssetsConfig,
  defaultSiteConfig,
} from "../../src/lib/site-config";
import {
  initialMediaAssets,
  MediaAsset,
} from "../../src/lib/mock-data";

interface StagedSlot {
  file: File;
  previewUrl: string;
}

export default function MediaAssetsAdminPage() {
  const [siteConfig, setSiteConfig] = useState<SiteAssetsConfig>(defaultSiteConfig);
  const [loading, setLoading] = useState(true);

  // Per-slot Staging State (Local Previews before Upload & Apply)
  const [stagedSlots, setStagedSlots] = useState<Record<string, StagedSlot>>({});
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [slotFeedback, setSlotFeedback] = useState<Record<string, string>>({});

  // Dynamic/Static Switch Confirmation Modal
  const [pendingToggle, setPendingToggle] = useState<boolean | null>(null);
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Storage explorer state
  const [assets, setAssets] = useState<MediaAsset[]>(initialMediaAssets);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Client helper for uploading to /api/upload
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

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(stagedSlots).forEach((s) => {
        URL.revokeObjectURL(s.previewUrl);
      });
    };
  }, [stagedSlots]);

  // Save specific config update to server
  const persistConfig = async (newConfig: SiteAssetsConfig) => {
    setSiteConfig(newConfig);
    try {
      const res = await fetch("/api/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      if (!res.ok) {
        throw new Error("Gagal menyimpan konfigurasi ke database");
      }
      return true;
    } catch (err) {
      console.error("Failed to save config:", err);
      return false;
    }
  };

  const showSlotFeedback = (slotId: string, msg: string) => {
    setSlotFeedback((prev) => ({ ...prev, [slotId]: msg }));
    setTimeout(() => {
      setSlotFeedback((prev) => {
        const copy = { ...prev };
        delete copy[slotId];
        return copy;
      });
    }, 3000);
  };

  // Stage a file locally
  const handleStageFile = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke previous object URL if any
    if (stagedSlots[slotId]) {
      URL.revokeObjectURL(stagedSlots[slotId].previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setStagedSlots((prev) => ({
      ...prev,
      [slotId]: { file, previewUrl },
    }));
    e.target.value = "";
  };

  // Cancel local staged preview
  const handleCancelPreview = (slotId: string) => {
    if (stagedSlots[slotId]) {
      URL.revokeObjectURL(stagedSlots[slotId].previewUrl);
      setStagedSlots((prev) => {
        const copy = { ...prev };
        delete copy[slotId];
        return copy;
      });
    }
  };

  // Apply staged file (Upload to Cloudinary & Save to DB slot)
  const handleApplySlot = async (
    slotId: string,
    folder: string,
    updateFn: (url: string) => SiteAssetsConfig
  ) => {
    const staged = stagedSlots[slotId];
    if (!staged) return;

    setUploadingSlot(slotId);
    try {
      const uploaded = await uploadFileToServer(staged.file, folder);
      const updatedConfig = updateFn(uploaded.url);
      const saved = await persistConfig(updatedConfig);

      if (saved) {
        // Clean up preview
        URL.revokeObjectURL(staged.previewUrl);
        setStagedSlots((prev) => {
          const copy = { ...prev };
          delete copy[slotId];
          return copy;
        });

        showSlotFeedback(slotId, "Aset berhasil diupload & diterapkan!");

        // Add to explorer
        setAssets((prev) => [
          {
            id: `med-${Date.now()}`,
            name: staged.file.name,
            type: folder.includes("comedian")
              ? "HEADSHOT"
              : folder.includes("flyer")
              ? "FLYER"
              : "BANNER",
            size: uploaded.size,
            url: uploaded.url,
            uploadedAt: new Date().toISOString().split("T")[0] || "2026-10-01",
          },
          ...prev,
        ]);
      }
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah dan menerapkan aset.");
    } finally {
      setUploadingSlot(null);
    }
  };

  // Reset a slot to default
  const handleResetSlot = async (
    slotId: string,
    resetFn: () => SiteAssetsConfig
  ) => {
    if (stagedSlots[slotId]) {
      handleCancelPreview(slotId);
    }
    const updated = resetFn();
    const saved = await persistConfig(updated);
    if (saved) {
      showSlotFeedback(slotId, "Slot di-reset ke aset bawaan.");
    }
  };

  // Toggle dynamic vs static mode with confirmation
  const handleRequestToggleDynamic = () => {
    setPendingToggle(!siteConfig.useDynamicAssets);
    setToggleModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (pendingToggle === null) return;
    setToggling(true);
    try {
      const targetVal = pendingToggle;
      const updated: SiteAssetsConfig = {
        ...siteConfig,
        useDynamicAssets: targetVal,
      };
      await persistConfig(updated);
      setToggleModalOpen(false);
      setPendingToggle(null);
    } catch (err) {
      alert("Gagal mengubah mode tampilan.");
    } finally {
      setToggling(false);
    }
  };

  // Copy URL in Explorer
  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteAsset = (id: string) => {
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
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#FF4500]" />
            <span>Dedicated Media Slots & Asset Staging</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Sistem upload per-slot dengan staging preview lokal sebelum disimpan permanen ke database Neon dan Cloudinary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`${webUrl}/?view_mode=static`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-bold border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            title="Cek tampilan mode statis bawaan tanpa merubah database"
          >
            <Eye className="w-3.5 h-3.5 text-black" />
            <span>Preview Mode Statis</span>
          </a>

          <a
            href={`${webUrl}/?view_mode=dynamic`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FF4500] hover:bg-[#E03E00] text-white text-xs font-bold border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            title="Cek tampilan mode dinamis upload tanpa merubah database"
          >
            <Eye className="w-3.5 h-3.5 text-white" />
            <span>Preview Mode Dinamis</span>
          </a>

          <a
            href={webUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            title="Buka tampilan landing page publik saat ini"
          >
            <span>Web Publik</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
          </a>
        </div>
      </div>

      {/* 2. Global Sync Toggle Banner (With Confirmation Dialog) */}
      <div
        className={`border-4 border-black p-6 transition-all shadow-[6px_6px_0px_0px_#000000] ${
          siteConfig.useDynamicAssets
            ? "bg-[#FFF8F6] border-black"
            : "bg-white border-black"
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
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border-2 border-black ${
                    siteConfig.useDynamicAssets
                      ? "bg-emerald-400 text-black shadow-[2px_2px_0px_0px_#000]"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {siteConfig.useDynamicAssets
                    ? "DYNAMIC MODE ACTIVE"
                    : "STATIC FALLBACK ONLY"}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                {siteConfig.useDynamicAssets
                  ? "Mode Dinamis Aktif: Aset yang telah di-apply menimpa visual landing page publik. Jika ada slot kosong, otomatis memakai fallback statis."
                  : "Mode Statis Aktif: Landing page publik mengunci tampilan pada aset desain bawaan asli. Upload tidak memengaruhi publik sebelum switch diaktifkan."}
              </p>
            </div>
          </div>

          {/* Toggle Button with Confirmation Modal Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleRequestToggleDynamic}
              className={`px-5 py-3 border-2 border-black font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                siteConfig.useDynamicAssets
                  ? "bg-black text-white hover:bg-[#FF4500]"
                  : "bg-[#FF4500] text-white hover:bg-[#E03E00]"
              }`}
            >
              {siteConfig.useDynamicAssets
                ? "NONAKTIFKAN (KE STATIS)"
                : "AKTIFKAN MODE DINAMIS"}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Asset Specifications Guide Card */}
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
          <div className="bg-gray-50 border-2 border-black p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">1. Hero Stage Visual</span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-black text-white">1:1 / 4:3</span>
              </div>
              <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                Foto panggung atau visual utama hero section.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-200 text-[10px] text-gray-500 font-mono">
              • Rekomendasi: 1080 × 1080 px (WebP / PNG)
            </div>
          </div>

          <div className="bg-gray-50 border-2 border-black p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">2. Comedian Headshot</span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#FF4500] text-white">1:1 Square</span>
              </div>
              <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                Foto profil komika roster untuk card Lineup.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-200 text-[10px] text-gray-500 font-mono">
              • Rekomendasi: 800 × 800 px (Grayscale filter)
            </div>
          </div>

          <div className="bg-gray-50 border-2 border-black p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">3. Event Flyer</span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-black text-white">4:5 Portrait</span>
              </div>
              <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                Poster acara open mic dan show berbayar.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-200 text-[10px] text-gray-500 font-mono">
              • Rekomendasi: 1080 × 1350 px (JPG / PNG)
            </div>
          </div>

          <div className="bg-gray-50 border-2 border-black p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">4. Merch Product</span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#FF4500] text-white">1:1 Square</span>
              </div>
              <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                Foto produk kaos, hoodie, dan merchandise.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-200 text-[10px] text-gray-500 font-mono">
              • Rekomendasi: 800 × 800 px (Transparan PNG)
            </div>
          </div>
        </div>
      </div>

      {/* 4. DEDICATED UPLOAD SLOTS WITH STAGING & PER-SLOT SAVE */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#FF4500] border border-black inline-block" />
            <h2 className="text-base font-bold text-gray-900 uppercase font-['Space_Mono',monospace]">
              Dedicated Asset Slots (Staging & Per-Slot Save)
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Setiap kartu memiliki tombol simpan dan batal mandiri.
          </span>
        </div>

        {/* SLOT 1: HERO VISUAL */}
        {(() => {
          const slotId = "hero";
          const staged = stagedSlots[slotId];
          const isUploading = uploadingSlot === slotId;
          const feedback = slotFeedback[slotId];
          const activeImage = staged ? staged.previewUrl : siteConfig.hero.url;

          return (
            <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-black">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF4500]" />
                    <h3 className="text-sm font-bold text-gray-900 uppercase font-['Space_Mono',monospace] tracking-wider">
                      Slot 1: Hero Stage Visual
                    </h3>
                    {staged && (
                      <span className="px-2 py-0.5 bg-yellow-300 text-black text-[10px] font-bold border border-black animate-pulse">
                        STAGING (LOKAL)
                      </span>
                    )}
                    {feedback && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-400">
                        ✓ {feedback}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Visual utama panggung di header landing page.
                  </p>
                </div>

                {/* Per-Slot Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {staged ? (
                    <>
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => handleCancelPreview(slotId)}
                        className="px-3 py-1.5 bg-white border-2 border-black text-gray-700 hover:bg-gray-100 font-bold text-xs uppercase cursor-pointer"
                      >
                        Cancel Preview
                      </button>
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() =>
                          handleApplySlot(slotId, "stup-timika/hero", (url) => ({
                            ...siteConfig,
                            hero: {
                              ...siteConfig.hero,
                              url,
                              isCustom: true,
                            },
                          }))
                        }
                        className="px-4 py-1.5 bg-emerald-600 text-white border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] hover:bg-emerald-700 active:translate-y-0.5 cursor-pointer flex items-center gap-1.5"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload & Apply</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      {siteConfig.hero.isCustom && (
                        <button
                          type="button"
                          onClick={() =>
                            handleResetSlot(slotId, () => ({
                              ...siteConfig,
                              hero: { ...defaultSiteConfig.hero },
                            }))
                          }
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-400 text-xs font-bold cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset to Default</span>
                        </button>
                      )}
                      <label className="px-3.5 py-1.5 bg-black text-white hover:bg-[#FF4500] border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih Gambar Baru</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleStageFile(slotId, e)}
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Preview Container */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-center">
                <div className="md:col-span-5">
                  <div className="w-full max-w-[340px] aspect-[4/3] bg-[#FFF8F6] border-2 border-black shadow-[6px_6px_0px_0px_#000000] relative overflow-hidden flex flex-col justify-between p-4">
                    {activeImage ? (
                      <>
                        <Image
                          src={activeImage}
                          alt="Hero Preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                        <div className="relative z-10">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold border border-black ${
                              staged
                                ? "bg-yellow-300 text-black"
                                : "bg-black text-white"
                            }`}
                          >
                            {staged ? "LOCAL STAGING" : "ACTIVE CLOUDINARY"}
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
                        <div className="my-auto text-center border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_#000]">
                          <span className="font-bold text-base text-gray-900 uppercase block">
                            {siteConfig.hero.title}
                          </span>
                          <span className="font-bold text-xs text-[#FF4500] uppercase block">
                            {siteConfig.hero.subtitle}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-gray-500 text-center">
                          (Tampilan Bawaan Statis)
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="md:col-span-7 space-y-2 text-xs text-gray-600">
                  <div className="font-bold text-gray-900">
                    Status Slot:{" "}
                    {staged ? (
                      <span className="text-yellow-700 bg-yellow-100 px-2 py-0.5 border border-yellow-300">
                        Preview Lokal (Belum Terupload)
                      </span>
                    ) : siteConfig.hero.isCustom ? (
                      <span className="text-orange-600 bg-orange-50 px-2 py-0.5 border border-orange-200">
                        Tersimpan di Cloudinary & Database
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                        Default Typographic Card
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed">
                    Saat memilih file gambar, preview lokal akan langsung ditampilkan di kartu ini tanpa melakukan network request ke Cloudinary. Klik <strong>Upload & Apply</strong> untuk menyimpan permanen ke slot database.
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* SLOT 2: COMEDIANS HEADSHOTS */}
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
          <div className="pb-4 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h3 className="text-sm font-bold text-gray-900 uppercase font-['Space_Mono',monospace] tracking-wider">
                Slot 2: Comedians / Lineup Headshots
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Foto headshot komika roster pada seksi THE LINEUP (Rasio 1:1 Square).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {siteConfig.comedians.map((c) => {
              const slotId = `comedian-${c.id}`;
              const staged = stagedSlots[slotId];
              const isUploading = uploadingSlot === slotId;
              const feedback = slotFeedback[slotId];
              const activeAvatar = staged ? staged.previewUrl : c.avatarUrl;

              return (
                <div
                  key={c.id}
                  className="border-2 border-black p-4 bg-gray-50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-300">
                      <span className="font-bold text-xs text-gray-900">{c.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-black text-white font-bold">
                        {c.badge}
                      </span>
                    </div>

                    {/* Preview Frame */}
                    <div className="mt-3 aspect-square bg-white border-2 border-black relative overflow-hidden flex items-center justify-center">
                      {activeAvatar ? (
                        <Image
                          src={activeAvatar}
                          alt={c.name}
                          fill
                          className="object-cover filter grayscale contrast-125"
                        />
                      ) : (
                        <div className="text-center p-3">
                          <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                          <span className="text-[11px] text-gray-400 font-mono block">
                            Avatar Bawaan
                          </span>
                        </div>
                      )}

                      {staged && (
                        <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-yellow-300 border border-black text-[9px] font-bold">
                          STAGING
                        </div>
                      )}
                    </div>

                    {feedback && (
                      <div className="mt-2 p-1 text-center bg-emerald-100 border border-emerald-400 text-emerald-800 text-[10px] font-bold">
                        ✓ {feedback}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between gap-2">
                    {staged ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => handleCancelPreview(slotId)}
                          className="flex-1 py-1 text-[10px] font-bold border border-black bg-white hover:bg-gray-100"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() =>
                            handleApplySlot(
                              slotId,
                              "stup-timika/comedians",
                              (url) => ({
                                ...siteConfig,
                                comedians: siteConfig.comedians.map((item) =>
                                  item.id === c.id
                                    ? { ...item, avatarUrl: url, isCustom: true }
                                    : item
                                ),
                              })
                            )
                          }
                          className="flex-1 py-1 text-[10px] font-bold border border-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1"
                        >
                          {isUploading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Upload"
                          )}
                        </button>
                      </div>
                    ) : (
                      <>
                        {c.isCustom && (
                          <button
                            type="button"
                            onClick={() =>
                              handleResetSlot(slotId, () => ({
                                ...siteConfig,
                                comedians: siteConfig.comedians.map((item) =>
                                  item.id === c.id
                                    ? { ...item, avatarUrl: null, isCustom: false }
                                    : item
                                ),
                              }))
                            }
                            className="text-[10px] font-bold text-gray-600 hover:text-black flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                        )}
                        <label className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 bg-black hover:bg-[#FF4500] text-white text-[10px] font-bold border border-black cursor-pointer">
                          <Upload className="w-3 h-3" />
                          <span>Pilih Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleStageFile(slotId, e)}
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SLOT 3: SHOW FLYERS */}
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
          <div className="pb-4 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-gray-900 uppercase font-['Space_Mono',monospace] tracking-wider">
                Slot 3: Upcoming Show Flyers
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Poster flyer show panggung TapTap (Rasio 4:5 Portrait).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {siteConfig.flyers.map((f) => {
              const slotId = `flyer-${f.id}`;
              const staged = stagedSlots[slotId];
              const isUploading = uploadingSlot === slotId;
              const feedback = slotFeedback[slotId];
              const activeFlyer = staged ? staged.previewUrl : f.flyerUrl;

              return (
                <div
                  key={f.id}
                  className="border-2 border-black p-4 bg-gray-50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-300">
                      <span className="font-bold text-xs text-gray-900">{f.title}</span>
                      <span className="text-[10px] text-gray-600 font-mono">{f.venue}</span>
                    </div>

                    {/* Preview Frame */}
                    <div className="mt-3 aspect-[4/5] max-h-[220px] bg-white border-2 border-black relative overflow-hidden flex items-center justify-center mx-auto w-full">
                      {activeFlyer ? (
                        <Image
                          src={activeFlyer}
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

                      {staged && (
                        <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-yellow-300 border border-black text-[9px] font-bold">
                          STAGING
                        </div>
                      )}
                    </div>

                    {feedback && (
                      <div className="mt-2 p-1 text-center bg-emerald-100 border border-emerald-400 text-emerald-800 text-[10px] font-bold">
                        ✓ {feedback}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between gap-2">
                    {staged ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => handleCancelPreview(slotId)}
                          className="flex-1 py-1 text-[10px] font-bold border border-black bg-white hover:bg-gray-100"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() =>
                            handleApplySlot(slotId, "stup-timika/flyers", (url) => ({
                              ...siteConfig,
                              flyers: siteConfig.flyers.map((item) =>
                                item.id === f.id
                                  ? { ...item, flyerUrl: url, isCustom: true }
                                  : item
                              ),
                            }))
                          }
                          className="flex-1 py-1 text-[10px] font-bold border border-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1"
                        >
                          {isUploading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Upload"
                          )}
                        </button>
                      </div>
                    ) : (
                      <>
                        {f.isCustom && (
                          <button
                            type="button"
                            onClick={() =>
                              handleResetSlot(slotId, () => ({
                                ...siteConfig,
                                flyers: siteConfig.flyers.map((item) =>
                                  item.id === f.id
                                    ? { ...item, flyerUrl: null, isCustom: false }
                                    : item
                                ),
                              }))
                            }
                            className="text-[10px] font-bold text-gray-600 hover:text-black flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                        )}
                        <label className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 bg-black hover:bg-[#FF4500] text-white text-[10px] font-bold border border-black cursor-pointer">
                          <Upload className="w-3 h-3" />
                          <span>Pilih Flyer</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleStageFile(slotId, e)}
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SLOT 4: MERCH PRODUCTS */}
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
          <div className="pb-4 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-gray-900 uppercase font-['Space_Mono',monospace] tracking-wider">
                Slot 4: Store Merchandise Items
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Visual produk merchandise official (Rasio 1:1 Square).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {siteConfig.merch.map((m) => {
              const slotId = `merch-${m.id}`;
              const staged = stagedSlots[slotId];
              const isUploading = uploadingSlot === slotId;
              const feedback = slotFeedback[slotId];
              const activeImage = staged ? staged.previewUrl : m.imageUrl;

              return (
                <div
                  key={m.id}
                  className="border-2 border-black p-4 bg-gray-50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-300">
                      <span className="font-bold text-xs text-gray-900">{m.name}</span>
                      <span className="text-[11px] font-bold text-orange-600 font-mono">
                        {m.price}
                      </span>
                    </div>

                    {/* Preview Frame */}
                    <div className="mt-3 aspect-square max-h-[180px] bg-white border-2 border-black relative overflow-hidden flex items-center justify-center mx-auto w-full">
                      {activeImage ? (
                        <Image
                          src={activeImage}
                          alt={m.name}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="text-center p-3">
                          <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                          <span className="text-[11px] text-gray-400 font-mono block">
                            Mock Box Bawaan
                          </span>
                        </div>
                      )}

                      {staged && (
                        <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-yellow-300 border border-black text-[9px] font-bold">
                          STAGING
                        </div>
                      )}
                    </div>

                    {feedback && (
                      <div className="mt-2 p-1 text-center bg-emerald-100 border border-emerald-400 text-emerald-800 text-[10px] font-bold">
                        ✓ {feedback}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between gap-2">
                    {staged ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => handleCancelPreview(slotId)}
                          className="flex-1 py-1 text-[10px] font-bold border border-black bg-white hover:bg-gray-100"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() =>
                            handleApplySlot(slotId, "stup-timika/merch", (url) => ({
                              ...siteConfig,
                              merch: siteConfig.merch.map((item) =>
                                item.id === m.id
                                  ? { ...item, imageUrl: url, isCustom: true }
                                  : item
                              ),
                            }))
                          }
                          className="flex-1 py-1 text-[10px] font-bold border border-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1"
                        >
                          {isUploading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Upload"
                          )}
                        </button>
                      </div>
                    ) : (
                      <>
                        {m.isCustom && (
                          <button
                            type="button"
                            onClick={() =>
                              handleResetSlot(slotId, () => ({
                                ...siteConfig,
                                merch: siteConfig.merch.map((item) =>
                                  item.id === m.id
                                    ? { ...item, imageUrl: null, isCustom: false }
                                    : item
                                ),
                              }))
                            }
                            className="text-[10px] font-bold text-gray-600 hover:text-black flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                        )}
                        <label className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 bg-black hover:bg-[#FF4500] text-white text-[10px] font-bold border border-black cursor-pointer">
                          <Upload className="w-3 h-3" />
                          <span>Pilih Foto Produk</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleStageFile(slotId, e)}
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
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

          <div className="flex flex-wrap gap-1.5">
            {["ALL", "BANNER", "FLYER", "HEADSHOT", "DOCUMENTATION"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border border-black ${
                  selectedType === type
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-100 text-gray-800"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between overflow-hidden"
            >
              <div className="h-32 bg-gray-900 flex flex-col justify-between p-3 relative overflow-hidden">
                <div className="flex justify-between items-start z-10">
                  <span className="px-2 py-0.5 bg-white text-gray-900 text-[10px] font-bold uppercase tracking-wider">
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

              <div className="p-2.5 bg-white border-t-2 border-black flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(asset.id, asset.url)}
                  className="flex items-center gap-1 text-gray-700 hover:text-black font-bold cursor-pointer"
                >
                  {copiedId === asset.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
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
                  onClick={() => handleDeleteAsset(asset.id)}
                  className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                  title="Hapus Aset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal for Landing Page Mode Toggle */}
      {toggleModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={() => !toggling && setToggleModalOpen(false)}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-4 border-black p-6 md:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#000000] relative animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-[#FFE9E3] border-2 border-black flex items-center justify-center text-[#FF4500] shrink-0 shadow-[2px_2px_0px_0px_#000]">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Space_Mono',monospace] font-bold text-base md:text-lg text-gray-900 uppercase">
                    Ubah Mode Tampilan Landing Page?
                  </h3>
                  <p className="text-xs text-gray-500">
                    Konfigurasi Tampilan Publik Web
                  </p>
                </div>
              </div>

              <p className="text-xs md:text-sm text-gray-700 leading-relaxed mb-6 font-medium">
                Beralih ke mode{" "}
                <strong className="text-black font-bold">
                  {pendingToggle ? "Dinamis (Aset Cloud)" : "Statis (Aset Bawaan Asli)"}
                </strong>{" "}
                akan mengubah sumber aset yang dilihat oleh seluruh pengunjung web publik.
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-gray-100">
                <button
                  type="button"
                  disabled={toggling}
                  onClick={() => {
                    setToggleModalOpen(false);
                    setPendingToggle(null);
                  }}
                  className="px-4 py-2 border-2 border-black font-bold text-xs uppercase tracking-wider hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={toggling}
                  onClick={handleConfirmToggle}
                  className="px-4 py-2 bg-[#FF4500] text-white border-2 border-black font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:bg-[#E03E00] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all flex items-center gap-2"
                >
                  {toggling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Ya, Terapkan Perubahan</span>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
