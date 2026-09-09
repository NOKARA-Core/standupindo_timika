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
  Images,
  FolderOpen,
  Handshake,
  Plus,
  Edit2,
  Globe,
} from "lucide-react";
import {
  SiteAssetsConfig,
  defaultSiteConfig,
} from "../../src/lib/site-config";
import {
  MediaAsset,
} from "../../src/lib/mock-data";

interface StagedSlot {
  file: File | null;
  previewUrl: string;
  source: "local" | "storage";
  assetName?: string;
}

export interface PartnerItem {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export default function MediaAssetsAdminPage() {
  const [siteConfig, setSiteConfig] = useState<SiteAssetsConfig>(defaultSiteConfig);
  const [loading, setLoading] = useState(true);

  // Per-slot Staging State (Local Previews before Upload & Apply)
  const [stagedSlots, setStagedSlots] = useState<Record<string, StagedSlot>>({});
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [slotFeedback, setSlotFeedback] = useState<Record<string, string>>({});

  // Media Picker Modal (to pick from already uploaded assets)
  const [pickerSlotId, setPickerSlotId] = useState<string | null>(null);
  const [pickerTypeFilter, setPickerTypeFilter] = useState<string>("ALL");
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Storage explorer state (loaded from Neon DB /api/media-assets)
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Partners & Sponsors Manager State
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerItem | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerWebsite, setPartnerWebsite] = useState("");
  const [partnerOrder, setPartnerOrder] = useState<number>(1);
  const [partnerLogoStaged, setPartnerLogoStaged] = useState<{
    file: File | null;
    previewUrl: string;
    source: "local" | "storage";
  } | null>(null);
  const [isSavingPartner, setIsSavingPartner] = useState(false);
  const [isDeletingPartnerId, setIsDeletingPartnerId] = useState<string | null>(null);

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

  const fetchMediaAssets = async () => {
    try {
      const res = await fetch("/api/media-assets");
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (err) {
      console.warn("Could not load media assets:", err);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await fetch("/api/partners");
      if (res.ok) {
        const data = await res.json();
        setPartners(data);
      }
    } catch (err) {
      console.warn("Could not load partners:", err);
    }
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
    fetchMediaAssets();
    fetchPartners();
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(stagedSlots).forEach((s) => {
        if (s.source === "local") {
          URL.revokeObjectURL(s.previewUrl);
        }
      });
      if (partnerLogoStaged && partnerLogoStaged.source === "local") {
        URL.revokeObjectURL(partnerLogoStaged.previewUrl);
      }
    };
  }, [stagedSlots, partnerLogoStaged]);

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

  // Stage a local file
  const handleStageFile = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (stagedSlots[slotId] && stagedSlots[slotId].source === "local") {
      URL.revokeObjectURL(stagedSlots[slotId].previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setStagedSlots((prev) => ({
      ...prev,
      [slotId]: { file, previewUrl, source: "local", assetName: file.name },
    }));
    e.target.value = "";
  };

  // Cancel staging preview
  const handleCancelPreview = (slotId: string) => {
    if (stagedSlots[slotId] && stagedSlots[slotId].source === "local") {
      URL.revokeObjectURL(stagedSlots[slotId].previewUrl);
    }
    setStagedSlots((prev) => {
      const copy = { ...prev };
      delete copy[slotId];
      return copy;
    });
  };

  // Open media picker to choose from already uploaded Cloudinary images
  const handleOpenMediaPicker = (slotId: string, defaultType: string = "ALL") => {
    setPickerSlotId(slotId);
    setPickerTypeFilter(defaultType);
    setIsPickerOpen(true);
  };

  // Select existing asset from picker (avoids re-uploading to Cloudinary)
  const handleSelectAssetFromPicker = (asset: MediaAsset) => {
    if (!pickerSlotId) return;

    if (pickerSlotId === "partner-logo") {
      setPartnerLogoStaged({
        file: null,
        previewUrl: asset.url,
        source: "storage",
      });
      setIsPickerOpen(false);
      setPickerSlotId(null);
      return;
    }

    if (stagedSlots[pickerSlotId] && stagedSlots[pickerSlotId].source === "local") {
      URL.revokeObjectURL(stagedSlots[pickerSlotId].previewUrl);
    }

    setStagedSlots((prev) => ({
      ...prev,
      [pickerSlotId]: {
        file: null,
        previewUrl: asset.url,
        source: "storage",
        assetName: asset.name,
      },
    }));

    setIsPickerOpen(false);
    showSlotFeedback(pickerSlotId, `Dipilih dari storage: ${asset.name}`);
  };

  // Partner Manager handlers
  const openCreatePartnerModal = () => {
    setEditingPartner(null);
    setPartnerName("");
    setPartnerWebsite("");
    setPartnerOrder(partners.length + 1);
    setPartnerLogoStaged(null);
    setIsPartnerModalOpen(true);
  };

  const openEditPartnerModal = (partner: PartnerItem) => {
    setEditingPartner(partner);
    setPartnerName(partner.name);
    setPartnerWebsite(partner.websiteUrl || "");
    setPartnerOrder(partner.sortOrder || 1);
    setPartnerLogoStaged({
      file: null,
      previewUrl: partner.logoUrl,
      source: "storage",
    });
    setIsPartnerModalOpen(true);
  };

  const handleStagePartnerLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (partnerLogoStaged && partnerLogoStaged.source === "local") {
      URL.revokeObjectURL(partnerLogoStaged.previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setPartnerLogoStaged({
      file,
      previewUrl,
      source: "local",
    });
    e.target.value = "";
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      alert("Nama Brand/Partner wajib diisi.");
      return;
    }
    if (!partnerLogoStaged?.previewUrl) {
      alert("Silakan upload logo transparan untuk partner ini.");
      return;
    }

    setIsSavingPartner(true);
    try {
      let finalLogoUrl = partnerLogoStaged.previewUrl;

      // If local file, upload to Cloudinary
      if (partnerLogoStaged.source === "local" && partnerLogoStaged.file) {
        const uploaded = await uploadFileToServer(
          partnerLogoStaged.file,
          "stup-timika/partners"
        );
        finalLogoUrl = uploaded.url;
      }

      const payload = {
        id: editingPartner ? editingPartner.id : `partner-${Date.now()}`,
        name: partnerName.trim(),
        logoUrl: finalLogoUrl,
        websiteUrl: partnerWebsite.trim() || null,
        sortOrder: Number(partnerOrder) || 1,
        isActive: true,
      };

      const res = await fetch("/api/partners", {
        method: editingPartner ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menyimpan partner");
      }

      await fetchPartners();
      setIsPartnerModalOpen(false);
      setEditingPartner(null);
      setPartnerLogoStaged(null);
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan partner");
    } finally {
      setIsSavingPartner(false);
    }
  };

  const handleDeletePartner = async (id: string, name: string) => {
    if (!confirm(`Hapus partner / sponsor "${name}" dari storage & database?`)) return;
    setIsDeletingPartnerId(id);
    try {
      const res = await fetch(`/api/partners?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPartners((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Gagal menghapus partner");
      }
    } catch {
      alert("Gagal menghapus partner");
    } finally {
      setIsDeletingPartnerId(null);
    }
  };

  // Apply staged file (Uploads if local, or directly saves if chosen from storage)
  const handleApplySlot = async (
    slotId: string,
    folder: string,
    updateFn: (url: string) => SiteAssetsConfig
  ) => {
    const staged = stagedSlots[slotId];
    if (!staged) return;

    setUploadingSlot(slotId);
    try {
      let finalUrl = staged.previewUrl;

      // Only upload if it's a new local file
      if (staged.source === "local" && staged.file) {
        const uploaded = await uploadFileToServer(staged.file, folder);
        finalUrl = uploaded.url;
        URL.revokeObjectURL(staged.previewUrl);
      }

      const updatedConfig = updateFn(finalUrl);
      const saved = await persistConfig(updatedConfig);

      if (saved) {
        setStagedSlots((prev) => {
          const copy = { ...prev };
          delete copy[slotId];
          return copy;
        });

        showSlotFeedback(slotId, "Aset berhasil diterapkan ke database!");
        await fetchMediaAssets();
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

  // Copy URL in Explorer
  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteAsset = async (id: string, url?: string) => {
    const confirmed = confirm(
      "Apakah Anda yakin ingin menghapus gambar ini secara permanen?\n\nGambar akan dihapus dari Cloudinary Storage dan database."
    );
    if (!confirmed) return;

    setIsDeletingId(id);
    try {
      const params = new URLSearchParams();
      if (id) params.set("id", id);
      if (url) params.set("url", url);

      const res = await fetch(`/api/media-assets?${params.toString()}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus aset.");
      }

      setAssets((prev) =>
        prev.filter((item) => item.id !== id && (!url || item.url !== url))
      );

      // If any slot is currently staging this deleted image, cancel staging
      setStagedSlots((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.entries(next).forEach(([k, v]) => {
          if (v?.previewUrl === url) {
            delete next[k];
            changed = true;
          }
        });
        return changed ? next : prev;
      });

      // If active hero is using this deleted image, clear it
      if (url && siteConfig.hero?.url === url) {
        await handleResetSlot("hero", () => ({
          ...siteConfig,
          hero: { ...defaultSiteConfig.hero, url: null, isCustom: false },
        }));
      }
    } catch (err: any) {
      alert(err.message || "Gagal menghapus aset dari storage.");
    } finally {
      setIsDeletingId(null);
    }
  };

  const filteredAssets = assets.filter(
    (a) => selectedType === "ALL" || a.type === selectedType
  );

  const pickerFilteredAssets = assets.filter(
    (a) => pickerTypeFilter === "ALL" || a.type === pickerTypeFilter
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
            Sistem upload per-slot dengan staging preview lokal dan opsi memilih dari media storage tanpa upload ulang.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={webUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            title="Buka tampilan landing page publik saat ini"
          >
            <span>Buka Web Publik</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
          </a>
        </div>
      </div>

      {/* 2. Asset Specifications Guide Card */}
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
            Pilih file baru atau gunakan kembali gambar yang pernah diunggah.
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
                        {staged.source === "storage" ? "STAGING (DARI STORAGE)" : "STAGING (LOKAL)"}
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
                            <span>Menyimpan...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{staged.source === "storage" ? "Terapkan Aset" : "Upload & Apply"}</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      {(siteConfig.hero.url || siteConfig.hero.isCustom) && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Hapus gambar panggung dari Slot 1: Hero Visual?")) {
                              handleResetSlot(slotId, () => ({
                                ...siteConfig,
                                hero: { ...defaultSiteConfig.hero, url: null, isCustom: false },
                              }));
                            }
                          }}
                          className="px-3.5 py-1.5 bg-red-100 hover:bg-red-600 hover:text-white text-red-800 border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1.5 transition-colors active:translate-y-0.5"
                          title="Hapus gambar dari Slot 1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Gambar</span>
                        </button>
                      )}

                      {/* Pick from previously uploaded images */}
                      <button
                        type="button"
                        onClick={() => handleOpenMediaPicker(slotId, "BANNER")}
                        className="px-3.5 py-1.5 bg-[#FFF8F6] text-black hover:bg-yellow-300 border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1.5 active:translate-y-0.5"
                        title="Pilih gambar yang pernah diunggah sebelumnya"
                      >
                        <Images className="w-3.5 h-3.5 text-[#FF4500]" />
                        <span>Pilih Dari Storage</span>
                      </button>

                      {/* Upload new file */}
                      <label className="px-3.5 py-1.5 bg-black text-white hover:bg-[#FF4500] border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File Baru</span>
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
                        
                        {/* Floating quick delete button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (staged) {
                              handleCancelPreview(slotId);
                            } else {
                              if (confirm("Hapus gambar panggung hero ini?")) {
                                handleResetSlot(slotId, () => ({
                                  ...siteConfig,
                                  hero: { ...defaultSiteConfig.hero, url: null, isCustom: false },
                                }));
                              }
                            }
                          }}
                          className="absolute top-2 right-2 z-20 p-1.5 bg-red-600 hover:bg-red-700 text-white border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-colors"
                          title={staged ? "Batalkan preview staging" : "Hapus gambar hero"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="relative z-10">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold border border-black ${
                              staged
                                ? "bg-yellow-300 text-black"
                                : "bg-black text-white"
                            }`}
                          >
                            {staged
                              ? staged.source === "storage"
                                ? "DARI STORAGE"
                                : "LOCAL STAGING"
                              : "ACTIVE CLOUDINARY"}
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
                        {staged.source === "storage"
                          ? `Dipilih dari Storage (${staged.assetName || "gambar"})`
                          : "Preview File Lokal (Belum Terupload)"}
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
                    Anda dapat mengklik <strong>"Pilih Dari Storage"</strong> untuk memakai kembali gambar panggung yang pernah diunggah sebelumnya tanpa membuat upload ganda di Cloudinary.
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
                          {staged.source === "storage" ? "STORAGE" : "STAGING"}
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
                  <div className="mt-4 pt-3 border-t-2 border-black flex flex-col gap-2">
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
                            "Terapkan"
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-1.5">
                        {(c.avatarUrl || c.isCustom) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus foto profil untuk ${c.name}?`)) {
                                handleResetSlot(slotId, () => ({
                                  ...siteConfig,
                                  comedians: siteConfig.comedians.map((item) =>
                                    item.id === c.id
                                      ? { ...item, avatarUrl: null, isCustom: false }
                                      : item
                                  ),
                                }));
                              }
                            }}
                            className="text-[10px] font-bold text-red-700 hover:text-white hover:bg-red-600 flex items-center gap-1 cursor-pointer bg-red-100 border border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000] transition-colors"
                            title="Hapus foto profil"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        )}
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            type="button"
                            onClick={() => handleOpenMediaPicker(slotId, "HEADSHOT")}
                            className="p-1 bg-[#FFF8F6] border border-black text-black hover:bg-yellow-300"
                            title="Pilih dari storage"
                          >
                            <Images className="w-3.5 h-3.5 text-[#FF4500]" />
                          </button>
                          <label className="inline-flex items-center gap-1 px-2 py-1 bg-black hover:bg-[#FF4500] text-white text-[10px] font-bold border border-black cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleStageFile(slotId, e)}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SLOT 3: DOKUMENTASI KEGIATAN */}
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
          <div className="pb-4 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-gray-900 uppercase font-['Space_Mono',monospace] tracking-wider">
                Slot 3: Dokumentasi Kegiatan
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Panduan spesifikasi: Rasio 16:9 atau 4:3 (Dokumentasi panggung/kegiatan komunitas, Max: 2 MB). Terhubung ke galeri arsip bento halaman About.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {siteConfig.flyers.map((f) => {
              const slotId = `flyer-${f.id}`;
              const staged = stagedSlots[slotId];
              const isUploading = uploadingSlot === slotId;
              const feedback = slotFeedback[slotId];
              const activeFlyer = staged ? staged.previewUrl : (f.imageUrl || f.flyerUrl);

              return (
                <div
                  key={f.id}
                  className="border-2 border-black p-4 bg-gray-50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-300">
                      <div className="flex items-center gap-1.5 truncate">
                        {f.badge && (
                          <span className="px-1.5 py-0.2 bg-black text-white text-[9px] font-bold uppercase font-mono">
                            {f.badge}
                          </span>
                        )}
                        <span className="font-bold text-xs text-gray-900 truncate">{f.title}</span>
                      </div>
                      <span className="text-[10px] text-gray-600 font-mono ml-2 shrink-0">{f.venue}</span>
                    </div>

                    {/* Preview Frame 16:9 */}
                    <div className="mt-3 aspect-[16/9] max-h-[220px] bg-white border-2 border-black relative overflow-hidden flex items-center justify-center mx-auto w-full">
                      {activeFlyer ? (
                        <Image
                          src={activeFlyer}
                          alt={f.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-center p-3">
                          <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                          <span className="text-[11px] text-gray-400 font-mono block">
                            Format Arsip Teks Bawaan
                          </span>
                        </div>
                      )}

                      {staged && (
                        <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-yellow-300 border border-black text-[9px] font-bold">
                          {staged.source === "storage" ? "STORAGE" : "STAGING"}
                        </div>
                      )}
                    </div>

                    {feedback && (
                      <div className="mt-2 p-1 text-center bg-emerald-100 border border-emerald-400 text-emerald-800 text-[10px] font-bold">
                        ✓ {feedback}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-black flex flex-col gap-2">
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
                            handleApplySlot(slotId, "stup-timika/documentation", (url) => ({
                              ...siteConfig,
                              flyers: siteConfig.flyers.map((item) =>
                                item.id === f.id
                                  ? { ...item, flyerUrl: url, imageUrl: url, isCustom: true }
                                  : item
                              ),
                            }))
                          }
                          className="flex-1 py-1 text-[10px] font-bold border border-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1"
                        >
                          {isUploading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Terapkan"
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-1.5">
                        {(f.flyerUrl || f.imageUrl || f.isCustom) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus foto dokumentasi untuk ${f.title}?`)) {
                                handleResetSlot(slotId, () => ({
                                  ...siteConfig,
                                  flyers: siteConfig.flyers.map((item) =>
                                    item.id === f.id
                                      ? { ...item, flyerUrl: null, imageUrl: null, isCustom: false }
                                      : item
                                  ),
                                }));
                              }
                            }}
                            className="text-[10px] font-bold text-red-700 hover:text-white hover:bg-red-600 flex items-center gap-1 cursor-pointer bg-red-100 border border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000] transition-colors"
                            title="Hapus foto dokumentasi"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        )}
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            type="button"
                            onClick={() => handleOpenMediaPicker(slotId, "DOCUMENTATION")}
                            className="p-1 bg-[#FFF8F6] border border-black text-black hover:bg-yellow-300"
                            title="Pilih foto dokumentasi dari storage"
                          >
                            <Images className="w-3.5 h-3.5 text-[#FF4500]" />
                          </button>
                          <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-black hover:bg-[#FF4500] text-white text-[10px] font-bold border border-black cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleStageFile(slotId, e)}
                            />
                          </label>
                        </div>
                      </div>
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
                      <span className="text-[10px] font-bold text-black bg-[#10B981] px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000] font-mono">
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
                          {staged.source === "storage" ? "STORAGE" : "STAGING"}
                        </div>
                      )}
                    </div>

                    {feedback && (
                      <div className="mt-2 p-1 text-center bg-emerald-100 border border-emerald-400 text-emerald-800 text-[10px] font-bold">
                        ✓ {feedback}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-black flex flex-col gap-2">
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
                            "Terapkan"
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-1.5">
                        {(m.imageUrl || m.isCustom) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus foto produk untuk ${m.name}?`)) {
                                handleResetSlot(slotId, () => ({
                                  ...siteConfig,
                                  merch: siteConfig.merch.map((item) =>
                                    item.id === m.id
                                      ? { ...item, imageUrl: null, isCustom: false }
                                      : item
                                  ),
                                }));
                              }
                            }}
                            className="text-[10px] font-bold text-red-700 hover:text-white hover:bg-red-600 flex items-center gap-1 cursor-pointer bg-red-100 border border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000] transition-colors"
                            title="Hapus foto produk"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        )}
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            type="button"
                            onClick={() => handleOpenMediaPicker(slotId, "DOCUMENTATION")}
                            className="p-1 bg-[#FFF8F6] border border-black text-black hover:bg-yellow-300"
                            title="Pilih foto produk dari storage"
                          >
                            <Images className="w-3.5 h-3.5 text-[#FF4500]" />
                          </button>
                          <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-black hover:bg-[#FF4500] text-white text-[10px] font-bold border border-black cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleStageFile(slotId, e)}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. PARTNERS & SPONSORS MANAGER */}
      <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#000] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
          <div>
            <div className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-[#FF4500]" />
              <h2 className="text-base font-bold text-gray-900 uppercase font-['Space_Mono',monospace]">
                Partners & Sponsors Manager
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Kelola logo brand dan partner resmi yang tampil di continuous marquee ticker landing page web.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Add Partner Button */}
            <button
              type="button"
              onClick={openCreatePartnerModal}
              className="px-4 py-1.5 bg-black text-white hover:bg-[#FF4500] border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1.5 active:translate-y-0.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Partner / Sponsor</span>
            </button>
          </div>
        </div>

        {/* Partners Cards Grid */}
        {partners.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-8 text-center text-xs font-mono text-gray-500">
            Belum ada partner atau sponsor terdaftar. Klik "+ Add Partner / Sponsor" untuk menambahkan brand.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between overflow-hidden group hover:shadow-[6px_6px_0px_0px_#000] transition-all"
              >
                {/* Logo Frame with Checkerboard / Transparency Container */}
                <div className="p-3 bg-gray-50 border-b-2 border-black">
                  <div className="flex justify-between items-center mb-2">
                    <span className="px-2 py-0.5 bg-black text-white font-mono text-[10px] font-bold">
                      ORDER #{partner.sortOrder}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[9px] font-bold uppercase">
                      ACTIVE
                    </span>
                  </div>

                  <div className="h-28 w-full bg-white border-2 border-black relative overflow-hidden flex items-center justify-center p-3 shadow-[2px_2px_0px_0px_#000]">
                    {partner.logoUrl ? (
                      <Image
                        src={partner.logoUrl}
                        alt={partner.name}
                        fill
                        unoptimized
                        className="object-contain p-2 filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-200"
                      />
                    ) : (
                      <span className="text-xs text-gray-400 font-mono">No Logo</span>
                    )}
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="p-3 flex flex-col justify-between flex-1 gap-3 bg-white">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 truncate font-['Space_Mono',monospace]">
                      {partner.name}
                    </h4>
                    {partner.websiteUrl ? (
                      <a
                        href={partner.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-mono truncate max-w-full mt-0.5"
                      >
                        <Globe className="w-3 h-3 shrink-0" />
                        <span className="truncate">{partner.websiteUrl.replace(/^https?:\/\//, "")}</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-mono">Tanpa link website</span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openEditPartnerModal(partner)}
                      className="flex-1 py-1 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold border border-black flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      disabled={isDeletingPartnerId === partner.id}
                      onClick={() => handleDeletePartner(partner.id, partner.name)}
                      className="py-1 px-2.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 text-xs font-bold border border-black flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-[1px_1px_0px_0px_#000]"
                      title="Hapus partner"
                    >
                      {isDeletingPartnerId === partner.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. General Media & Asset Storage Explorer (Real Image Previews) */}
      <div className="pt-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Media Asset Storage Explorer
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Daftar seluruh file yang telah terunggah di Cloudinary & Neon DB ({assets.length} file)
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

        {/* Real Thumbnail Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.length === 0 ? (
            <div className="col-span-full bg-white border-2 border-black p-8 text-center text-gray-500 font-mono text-xs">
              Belum ada file media yang tersimpan di storage.
            </div>
          ) : (
            filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between overflow-hidden group hover:shadow-[6px_6px_0px_0px_#000] transition-all"
              >
                {/* Visual Thumbnail Area */}
                <div className="h-36 bg-gray-900 flex flex-col justify-between p-3 relative overflow-hidden">
                  {asset.url && (
                    <Image
                      src={asset.url}
                      alt={asset.name}
                      fill
                      unoptimized
                      className="object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />

                  <div className="flex justify-between items-start z-10 relative">
                    <span className="px-2 py-0.5 bg-white text-gray-900 text-[10px] font-bold uppercase tracking-wider">
                      {asset.type}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-white/90 font-mono font-bold bg-black/60 px-1">
                        {asset.size}
                      </span>
                      <button
                        type="button"
                        disabled={isDeletingId === asset.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAsset(asset.id, asset.url);
                        }}
                        className="p-1 bg-red-600/90 hover:bg-red-700 text-white border border-black cursor-pointer transition-colors shadow-[1px_1px_0px_0px_#000]"
                        title="Hapus gambar ini"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  <div className="my-auto z-10 relative">
                    <span className="text-[11px] text-white font-mono font-bold block px-1 truncate drop-shadow-md">
                      {asset.name}
                    </span>
                  </div>

                  <div className="text-[10px] text-white/70 z-10 relative font-mono">
                    Uploaded: {asset.uploadedAt}
                  </div>
                </div>

                {/* Card Action Bar */}
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
                    disabled={isDeletingId === asset.id}
                    onClick={() => handleDeleteAsset(asset.id, asset.url)}
                    className="px-2.5 py-1 bg-red-100 hover:bg-red-600 hover:text-white text-red-700 font-bold border border-black text-[11px] uppercase flex items-center gap-1 cursor-pointer transition-colors shadow-[1px_1px_0px_0px_#000]"
                    title="Hapus gambar secara permanen dari Cloudinary"
                  >
                    {isDeletingId === asset.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Media Picker Modal (Select from existing uploaded images) */}
      {isPickerOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={() => setIsPickerOpen(false)}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-4 border-black p-6 md:p-8 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-[8px_8px_0px_0px_#000000] relative animate-in zoom-in-95 duration-150"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-black">
                <div>
                  <h3 className="font-['Space_Mono',monospace] font-bold text-base md:text-lg text-gray-900 uppercase flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-[#FF4500]" />
                    <span>Pilih Gambar Dari Media Storage</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pilih gambar yang pernah diunggah sebelumnya tanpa perlu upload ulang ke Cloudinary.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(false)}
                  className="p-1 text-gray-500 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Type Filter Bar */}
              <div className="py-3 flex flex-wrap gap-1.5 border-b border-gray-200">
                {["ALL", "BANNER", "HEADSHOT", "FLYER", "DOCUMENTATION"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPickerTypeFilter(type)}
                    className={`px-2.5 py-1 text-xs font-bold uppercase transition-colors cursor-pointer border ${
                      pickerTypeFilter === type
                        ? "bg-black text-white border-black shadow-[2px_2px_0px_0px_#FF4500]"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Grid of Available Images */}
              <div className="flex-1 overflow-y-auto py-4 pr-1">
                {pickerFilteredAssets.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 font-mono text-xs border-2 border-dashed border-gray-300">
                    Tidak ada gambar yang cocok dengan filter ini di storage.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    {pickerFilteredAssets.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => handleSelectAssetFromPicker(asset)}
                        className="group bg-white border-2 border-black hover:border-[#FF4500] hover:shadow-[4px_4px_0px_0px_#000] transition-all cursor-pointer flex flex-col overflow-hidden"
                      >
                        {/* Thumbnail */}
                        <div className="h-28 bg-gray-900 relative overflow-hidden">
                          {asset.url && (
                            <Image
                              src={asset.url}
                              alt={asset.name}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                          <div className="absolute top-1 left-1">
                            <span className="px-1.5 py-0.2 bg-black text-white text-[9px] font-bold uppercase">
                              {asset.type}
                            </span>
                          </div>
                          <div className="absolute top-1 right-1 z-10">
                            <button
                              type="button"
                              disabled={isDeletingId === asset.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAsset(asset.id, asset.url);
                              }}
                              className="p-1 bg-red-600/90 hover:bg-red-700 text-white border border-black cursor-pointer transition-colors shadow-[1px_1px_0px_0px_#000]"
                              title="Hapus gambar permanen dari Cloudinary"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Button */}
                        <div className="p-2 flex flex-col justify-between flex-1">
                          <span className="text-[11px] font-bold text-gray-900 truncate font-mono">
                            {asset.name}
                          </span>
                          <span className="text-[9px] text-gray-500 font-mono">
                            {asset.size}
                          </span>
                          <div className="mt-2 flex items-center gap-1">
                            <div className="flex-1 text-center py-1 bg-gray-100 group-hover:bg-[#FF4500] group-hover:text-white text-[10px] font-bold uppercase border border-black transition-colors">
                              Gunakan Gambar
                            </div>
                            <button
                              type="button"
                              disabled={isDeletingId === asset.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAsset(asset.id, asset.url);
                              }}
                              className="p-1 bg-red-100 hover:bg-red-600 hover:text-white text-red-700 border border-black cursor-pointer transition-colors shadow-[1px_1px_0px_0px_#000]"
                              title="Hapus gambar secara permanen"
                            >
                              {isDeletingId === asset.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t-2 border-black flex items-center justify-between">
                <span className="text-xs text-gray-500 font-mono">
                  {pickerFilteredAssets.length} gambar tersedia di storage
                </span>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(false)}
                  className="px-4 py-1.5 border-2 border-black font-bold text-xs uppercase hover:bg-gray-100 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Partner Create / Edit Modal */}
      {isPartnerModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={() => !isSavingPartner && setIsPartnerModalOpen(false)}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-4 border-black max-w-lg w-full p-6 shadow-[8px_8px_0px_0px_#000] space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <h3 className="text-sm font-bold text-gray-900 uppercase font-['Space_Mono',monospace] tracking-wider flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-[#FF4500]" />
                  <span>
                    {editingPartner ? "Edit Partner / Sponsor" : "+ Add New Partner / Sponsor"}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="p-1 hover:bg-gray-100 border border-black cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePartner} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase mb-1">
                    Nama Brand / Partner *
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Contoh: KOPITIAM 88, TIMIKA BEATZ"
                    className="w-full border-2 border-black p-2 text-xs font-mono focus:outline-none focus:border-[#FF4500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase mb-1">
                    Website URL / Instagram (Opsional)
                  </label>
                  <input
                    type="url"
                    value={partnerWebsite}
                    onChange={(e) => setPartnerWebsite(e.target.value)}
                    placeholder="https://instagram.com/kopitiam88"
                    className="w-full border-2 border-black p-2 text-xs font-mono focus:outline-none focus:border-[#FF4500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase mb-1">
                    Urutan Tampilan (Sort Order)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={partnerOrder}
                    onChange={(e) => setPartnerOrder(Number(e.target.value))}
                    className="w-full border-2 border-black p-2 text-xs font-mono focus:outline-none focus:border-[#FF4500]"
                  />
                </div>

                {/* Upload Logo with Staging */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase mb-1">
                    Logo Brand (PNG/WebP Transparan Tanpa Background) *
                  </label>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => handleOpenMediaPicker("partner-logo", "DOCUMENTATION")}
                      className="px-3 py-1.5 bg-[#FFF8F6] text-black hover:bg-yellow-300 border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1.5"
                    >
                      <Images className="w-3.5 h-3.5 text-[#FF4500]" />
                      <span>Pilih Dari Storage</span>
                    </button>

                    <label className="px-3 py-1.5 bg-black text-white hover:bg-[#FF4500] border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File Transparan</span>
                      <input
                        type="file"
                        accept="image/png,image/webp,image/svg+xml"
                        onChange={handleStagePartnerLogo}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Staged Logo Preview Box */}
                  <div className="h-32 w-full bg-[#FFF8F6] border-2 border-black relative flex items-center justify-center p-3 shadow-[3px_3px_0px_0px_#000]">
                    {partnerLogoStaged ? (
                      <>
                        <Image
                          src={partnerLogoStaged.previewUrl}
                          alt="Partner Logo Preview"
                          fill
                          unoptimized
                          className="object-contain p-3"
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-yellow-300 border border-black text-[9px] font-bold">
                          {partnerLogoStaged.source === "local" ? "STAGING (LOKAL)" : "STAGING (STORAGE)"}
                        </div>
                        <button
                          type="button"
                          onClick={() => setPartnerLogoStaged(null)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white border border-black cursor-pointer hover:bg-red-700"
                          title="Hapus preview logo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2 text-gray-400 font-mono text-xs">
                        Belum ada logo yang dipilih.
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-4 border-t-2 border-black flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPartnerModalOpen(false)}
                    className="px-4 py-2 border-2 border-black font-bold text-xs uppercase hover:bg-gray-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPartner}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingPartner ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan ke Neon DB...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>SAVE PARTNER</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
