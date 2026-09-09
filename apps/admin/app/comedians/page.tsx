"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Mic2,
  Plus,
  Search,
  Check,
  X,
  Phone,
  Edit2,
  Trash2,
  Upload,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Camera,
  Images,
  Star,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { ComedianItem } from "../../src/lib/mock-data";
import MediaPickerModal from "../../src/components/MediaPickerModal";

export default function ComediansAdminPage() {
  const [comedians, setComedians] = useState<ComedianItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStyleFilter, setSelectedStyleFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComedian, setEditingComedian] = useState<ComedianItem | null>(null);
  const [deleteComedianId, setDeleteComedianId] = useState<string | null>(null);
  const [uploadingComedianId, setUploadingComedianId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Storage Media Picker states
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTargetComedianId, setPickerTargetComedianId] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Form states
  const [realName, setRealName] = useState("");
  const [stageName, setStageName] = useState("");
  const [comedyStyle, setComedyStyle] = useState<
    "Observational" | "Storytelling" | "Dark Comedy" | "Absurd"
  >("Observational");
  const [punchline, setPunchline] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [totalOpenMic, setTotalOpenMic] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isFeaturedLineup, setIsFeaturedLineup] = useState(false);
  const [lineupOrder, setLineupOrder] = useState(0);

  const fetchComedians = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/comedians");
      if (res.ok) {
        const data = await res.json();
        setComedians(data);
      }
    } catch (err) {
      console.error("Failed to load comedians:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComedians();
  }, []);

  const filteredComedians = comedians.filter((c) => {
    const matchSearch =
      c.stageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.realName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.comedyStyle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.punchline && c.punchline.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStyle =
      selectedStyleFilter === "ALL" ||
      c.comedyStyle.toLowerCase() === selectedStyleFilter.toLowerCase();
    return matchSearch && matchStyle;
  });

  const toggleStatus = async (c: ComedianItem) => {
    const nextActive = !c.isActive;
    setComedians((prev) =>
      prev.map((item) =>
        item.id === c.id ? { ...item, isActive: nextActive } : item
      )
    );

    try {
      const res = await fetch("/api/comedians", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, isActive: nextActive }),
      });
      if (!res.ok) await fetchComedians();
    } catch {
      await fetchComedians();
    }
  };

  const toggleFeatured = async (c: ComedianItem) => {
    const nextFeatured = !c.isFeaturedLineup;
    const currentFeaturedCount = comedians.filter((item) => item.isFeaturedLineup).length;
    const nextOrder = nextFeatured ? currentFeaturedCount + 1 : 0;

    setComedians((prev) =>
      prev.map((item) =>
        item.id === c.id
          ? { ...item, isFeaturedLineup: nextFeatured, lineupOrder: nextOrder }
          : item
      )
    );

    try {
      const res = await fetch("/api/comedians", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: c.id,
          isFeaturedLineup: nextFeatured,
          lineupOrder: nextOrder,
        }),
      });
      if (!res.ok) await fetchComedians();
    } catch {
      await fetchComedians();
    }
  };

  const openCreateModal = () => {
    setEditingComedian(null);
    setRealName("");
    setStageName("");
    setComedyStyle("Observational");
    setPunchline("");
    setBio("");
    setPhone("+628");
    setTotalOpenMic(0);
    setIsActive(true);
    setAvatarUrl("");
    setIsFeaturedLineup(false);
    setLineupOrder(comedians.filter((c) => c.isFeaturedLineup).length + 1);
    setPickerTargetComedianId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: ComedianItem) => {
    setEditingComedian(c);
    setRealName(c.realName);
    setStageName(c.stageName);
    setComedyStyle(c.comedyStyle);
    setPunchline(c.punchline);
    setBio(c.bio);
    setPhone(c.phone);
    setTotalOpenMic(c.totalOpenMic);
    setIsActive(c.isActive);
    setAvatarUrl(c.avatarUrl || "");
    setIsFeaturedLineup(Boolean(c.isFeaturedLineup));
    setLineupOrder(c.lineupOrder || 0);
    setPickerTargetComedianId(null);
    setIsModalOpen(true);
  };

  const handleSelectFromStorage = async (asset: { url: string; name: string }) => {
    if (pickerTargetComedianId) {
      try {
        const res = await fetch("/api/comedians", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: pickerTargetComedianId, avatarUrl: asset.url }),
        });
        if (res.ok) {
          setComedians((prev) =>
            prev.map((c) =>
              c.id === pickerTargetComedianId ? { ...c, avatarUrl: asset.url } : c
            )
          );
        }
      } catch (err) {
        console.error("Failed to update avatar from storage:", err);
      } finally {
        setPickerTargetComedianId(null);
      }
    } else {
      setAvatarUrl(asset.url);
    }
  };

  const handleModalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "stup-timika/talents");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setAvatarUrl(data.url);
      } else {
        alert("Gagal mengunggah foto.");
      }
    } catch (err) {
      console.error("Upload photo error:", err);
      alert("Terjadi kesalahan saat upload foto.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: Partial<ComedianItem> = {
        id: editingComedian ? editingComedian.id : `com-${Date.now()}`,
        realName,
        stageName,
        comedyStyle,
        punchline,
        bio,
        phone,
        totalOpenMic,
        isActive,
        avatarUrl: avatarUrl || undefined,
        isFeaturedLineup,
        lineupOrder: isFeaturedLineup ? lineupOrder : 0,
      };

      const res = await fetch("/api/comedians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchComedians();
        setIsModalOpen(false);
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menyimpan komika");
      }
    } catch (err) {
      console.error("Save comedian error:", err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteComedianId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/comedians?id=${deleteComedianId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComedians((prev) => prev.filter((item) => item.id !== deleteComedianId));
        setDeleteComedianId(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Gagal menghapus komika");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPhotoUpload = async (
    comedianId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingComedianId(comedianId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "stup-timika/talents");

      const resUpload = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!resUpload.ok) throw new Error("Upload failed");
      const uploadData = await resUpload.json();

      const resPatch = await fetch("/api/comedians", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: comedianId, avatarUrl: uploadData.url }),
      });

      if (resPatch.ok) {
        setComedians((prev) =>
          prev.map((c) =>
            c.id === comedianId ? { ...c, avatarUrl: uploadData.url } : c
          )
        );
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Gagal mengunggah foto komika.");
    } finally {
      setUploadingComedianId(null);
    }
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case "Observational":
        return "bg-[#FEF08A] text-black"; // Yellow pastel
      case "Storytelling":
        return "bg-[#E0E7FF] text-black"; // Indigo pastel
      case "Dark Comedy":
        return "bg-[#FED7AA] text-black"; // Orange pastel
      case "Absurd":
        return "bg-[#FBCFE8] text-black"; // Pink pastel
      default:
        return "bg-zinc-200 text-black";
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl md:text-2xl font-black font-mono tracking-tight uppercase text-black">
              COMEDIANS ROSTER DIRECTORY
            </h1>
            <span className="px-2.5 py-1 text-xs font-black font-mono bg-[#FFD700] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              {comedians.length} TOTAL TALENT
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-600 mt-1">
            Database profil panggung, punchline khas, jam terbang, dan featured lineup StandUp INDO Timika
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchComedians}
            className="p-2.5 bg-white border-3 border-black text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            title="Refresh Data dari DB"
          >
            <RefreshCw className={`w-4 h-4 stroke-[2.5] ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFD700] hover:bg-[#FFE55C] text-black text-xs font-black font-mono uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ ADD COMEDIAN</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="CARI NAMA, PUNCHLINE, GENRE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FDFBF7] border-3 border-black px-3.5 py-2.5 pl-10 text-xs font-mono font-bold text-black uppercase placeholder:text-zinc-400 placeholder:font-bold focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
          />
          <Search className="w-4 h-4 text-black stroke-[3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Genre Filter & Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black font-mono uppercase text-black hidden sm:inline">
              STYLE:
            </span>
            <select
              value={selectedStyleFilter}
              onChange={(e) => setSelectedStyleFilter(e.target.value)}
              className="bg-white border-3 border-black px-3 py-2 text-xs font-mono font-bold uppercase shadow-[3px_3px_0px_0px_#000] focus:outline-none cursor-pointer"
            >
              <option value="ALL">SEMUA GENRE</option>
              <option value="Observational">Observational</option>
              <option value="Storytelling">Storytelling</option>
              <option value="Dark Comedy">Dark Comedy</option>
              <option value="Absurd">Absurd</option>
            </select>
          </div>

          <span className="text-xs font-mono font-bold bg-black text-white px-2.5 py-1.5 border-2 border-black">
            {filteredComedians.length} DITEMUKAN
          </span>
        </div>
      </div>

      {/* 3. Table / Responsive Card View */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] overflow-hidden">
        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="bg-black text-white border-b-4 border-black">
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider">
                  TALENT PROFILE
                </th>
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider">
                  COMEDY STYLE
                </th>
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider">
                  PUNCHLINE SIGNATURE
                </th>
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider text-center">
                  HOMEPAGE LINEUP
                </th>
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider text-center">
                  TOTAL SHOWS
                </th>
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider text-center">
                  WEB VISIBILITY
                </th>
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && comedians.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-zinc-600 font-mono">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-black" />
                    <span className="font-bold">MEMUAT DAFTAR KOMIKA DARI NEON POSTGRESQL...</span>
                  </td>
                </tr>
              ) : filteredComedians.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-xs text-zinc-600 font-mono font-bold">
                    TIDAK ADA KOMIKA YANG SESUAI FILTER PENCARIAN.
                  </td>
                </tr>
              ) : (
                filteredComedians.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b-2 border-black hover:bg-[#FFFDF9] transition-colors"
                  >
                    {/* Talent Profile */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-zinc-100 border-3 border-black shrink-0 overflow-hidden shadow-[2px_2px_0px_0px_#000]">
                          {c.avatarUrl ? (
                            <Image
                              src={c.avatarUrl}
                              alt={c.stageName}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-yellow-100 font-black text-xs text-black">
                              {c.stageName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-sm text-black tracking-tight flex items-center gap-2">
                            <span>{c.stageName}</span>
                            {c.isFeaturedLineup && (
                              <span className="text-[10px] bg-[#FFD700] text-black px-1.5 py-0.2 border border-black font-black">
                                #{c.lineupOrder}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-600 font-medium truncate">
                            {c.realName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Style Badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-black uppercase border-2 border-black rotate-[-1deg] shadow-[1.5px_1.5px_0px_0px_#000] ${getStyleColor(
                          c.comedyStyle
                        )}`}
                      >
                        {c.comedyStyle}
                      </span>
                    </td>

                    {/* Punchline */}
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="text-xs text-zinc-800 italic font-medium truncate bg-zinc-50 border border-black/30 px-2 py-1">
                        &ldquo;{c.punchline || "Belum ada punchline"}&rdquo;
                      </div>
                    </td>

                    {/* Featured Lineup Toggle Switch */}
                    <td className="px-5 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(c)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
                          c.isFeaturedLineup
                            ? "bg-[#FFD700] text-black"
                            : "bg-white text-zinc-500 hover:text-black"
                        }`}
                        title="Klik untuk ubah status Homepage Featured Lineup"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            c.isFeaturedLineup ? "fill-black text-black" : "text-zinc-400"
                          }`}
                        />
                        <span>{c.isFeaturedLineup ? `SLOT #${c.lineupOrder}` : "OFF"}</span>
                      </button>
                    </td>

                    {/* Total Shows Digital Counter */}
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-block px-3 py-1 bg-black text-[#FFD700] font-black text-xs border-2 border-black shadow-[1.5px_1.5px_0px_0px_#FF4500]">
                        {c.totalOpenMic} SETS
                      </span>
                    </td>

                    {/* Visibility Switch */}
                    <td className="px-5 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleStatus(c)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
                          c.isActive
                            ? "bg-[#22C55E] text-black"
                            : "bg-zinc-300 text-zinc-700 line-through"
                        }`}
                      >
                        {c.isActive ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>ACTIVE</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                            <span>HIDDEN</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Storage Picker */}
                        <button
                          type="button"
                          onClick={() => {
                            setPickerTargetComedianId(c.id);
                            setIsPickerOpen(true);
                          }}
                          className="px-2 py-1 text-xs font-black bg-white hover:bg-yellow-200 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
                          title="Pilih foto dari Cloudinary Storage"
                        >
                          <Images className="w-3.5 h-3.5 text-[#FF4500]" />
                          <span className="hidden xl:inline">MEDIA</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="px-2.5 py-1 text-xs font-black bg-white hover:bg-[#FEF08A] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>EDIT</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteComedianId(c.id)}
                          className="px-2.5 py-1 text-xs font-black bg-red-500 hover:bg-red-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>DEL</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards View */}
        <div className="md:hidden divide-y-4 divide-black font-mono">
          {loading && comedians.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-zinc-600">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-black" />
              MEMUAT DATA KOMIKA...
            </div>
          ) : filteredComedians.length === 0 ? (
            <div className="p-6 text-center text-xs font-bold text-zinc-600">
              TIDAK ADA KOMIKA YANG SESUAI FILTER.
            </div>
          ) : (
            filteredComedians.map((c) => (
              <div key={c.id} className="p-4 bg-white space-y-3">
                <div className="flex items-start gap-3">
                  <div className="relative w-14 h-14 bg-zinc-100 border-3 border-black shrink-0 overflow-hidden shadow-[2px_2px_0px_0px_#000]">
                    {c.avatarUrl ? (
                      <Image
                        src={c.avatarUrl}
                        alt={c.stageName}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-yellow-100 font-black text-sm text-black">
                        {c.stageName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-black text-base text-black uppercase truncate">
                        {c.stageName}
                      </h3>
                      <span className="px-2 py-0.5 bg-black text-[#FFD700] text-[10px] font-black border border-black shrink-0">
                        {c.totalOpenMic} SETS
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 font-semibold truncate">{c.realName}</p>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase border border-black shadow-[1px_1px_0px_0px_#000] ${getStyleColor(
                          c.comedyStyle
                        )}`}
                      >
                        {c.comedyStyle}
                      </span>
                      {c.isFeaturedLineup && (
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-[#FFD700] text-black border border-black">
                          LINEUP #{c.lineupOrder}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {c.punchline && (
                  <div className="text-xs text-zinc-800 italic bg-[#FDFBF7] border-2 border-black p-2">
                    &ldquo;{c.punchline}&rdquo;
                  </div>
                )}

                <div className="pt-2 border-t-2 border-black flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleStatus(c)}
                      className={`px-2 py-1 text-[10px] font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                        c.isActive
                          ? "bg-[#22C55E] text-black"
                          : "bg-zinc-300 text-zinc-700 line-through"
                      }`}
                    >
                      {c.isActive ? "ACTIVE" : "HIDDEN"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFeatured(c)}
                      className={`px-2 py-1 text-[10px] font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                        c.isFeaturedLineup ? "bg-[#FFD700] text-black" : "bg-white text-zinc-600"
                      }`}
                    >
                      {c.isFeaturedLineup ? "LINEUP ON" : "LINEUP OFF"}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="px-2.5 py-1 bg-white hover:bg-yellow-200 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                    >
                      EDIT
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteComedianId(c.id)}
                      className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                    >
                      DEL
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Pure Neo-Brutalism Modal: Add / Edit Comedian */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border-4 border-black p-6 max-w-lg w-full shadow-[8px_8px_0px_0px_#000] max-h-[92vh] overflow-y-auto font-mono">
            {/* Modal Header Bar */}
            <div className="bg-[#FFD700] border-3 border-black p-3.5 mb-5 flex items-center justify-between shadow-[3px_3px_0px_0px_#000]">
              <div className="flex items-center gap-2">
                <Mic2 className="w-5 h-5 text-black stroke-[3]" />
                <h3 className="text-sm md:text-base font-black uppercase tracking-wider text-black">
                  {editingComedian ? "EDIT PROFILE KOMIKA" : "+ ADD NEW COMEDIAN"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-black text-white hover:bg-red-600 border-2 border-black transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    STAGE NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="MISAL: RIAN"
                    className="w-full bg-[#FDFBF7] border-2 border-black p-2.5 text-xs font-mono font-bold uppercase focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    REAL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    placeholder="MISAL: RIAN S."
                    className="w-full bg-[#FDFBF7] border-2 border-black p-2.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    COMEDY STYLE
                  </label>
                  <select
                    value={comedyStyle}
                    onChange={(e) =>
                      setComedyStyle(
                        e.target.value as
                          | "Observational"
                          | "Storytelling"
                          | "Dark Comedy"
                          | "Absurd"
                      )
                    }
                    className="w-full bg-white border-2 border-black p-2.5 text-xs font-mono font-bold uppercase focus:outline-none focus:shadow-[3px_3px_0px_0px_#000] cursor-pointer"
                  >
                    <option value="Observational">Observational</option>
                    <option value="Storytelling">Storytelling</option>
                    <option value="Dark Comedy">Dark Comedy</option>
                    <option value="Absurd">Absurd</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    TOTAL OPEN MIC SETS
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={totalOpenMic}
                    onChange={(e) => setTotalOpenMic(Number(e.target.value))}
                    className="w-full bg-[#FDFBF7] border-2 border-black p-2.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-black uppercase mb-1">
                  PUNCHLINE SIGNATURE *
                </label>
                <input
                  type="text"
                  required
                  value={punchline}
                  onChange={(e) => setPunchline(e.target.value)}
                  placeholder="Punchline signature yang muncul di web..."
                  className="w-full bg-[#FDFBF7] border-2 border-black p-2.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black uppercase mb-1">
                  BIO SINGKAT
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Karakter dan materi panggung komika..."
                  className="w-full bg-[#FDFBF7] border-2 border-black p-2.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black uppercase mb-1">
                  NO. WHATSAPP (AKTIF)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+628..."
                  className="w-full bg-[#FDFBF7] border-2 border-black p-2.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
                />
              </div>

              {/* Photo Asset Box */}
              <div className="border-3 border-black p-3.5 bg-[#FFFDF9] space-y-2 shadow-[2px_2px_0px_0px_#000]">
                <label className="block text-xs font-black text-black uppercase">
                  FOTO HEADSHOT TALENT
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 bg-white border-2 border-black overflow-hidden shrink-0 flex items-center justify-center shadow-[1px_1px_0px_0px_#000]">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Avatar preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPickerTargetComedianId(null);
                          setIsPickerOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-[#FFD700] hover:bg-[#FFE55C] text-black border-2 border-black text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        <Images className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>PILIH STORAGE</span>
                      </button>

                      <label className="px-2.5 py-1.5 bg-black hover:bg-[#FF4500] text-white border-2 border-black text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer">
                        {isUploadingPhoto ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                        <span>{isUploadingPhoto ? "UPLOADING..." : "UPLOAD FILE"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingPhoto}
                          onChange={handleModalPhotoUpload}
                          className="hidden"
                        />
                      </label>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl("")}
                          className="px-2 py-1 text-[11px] font-black text-red-600 hover:bg-red-500 hover:text-white border border-black transition-colors"
                        >
                          HAPUS
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="URL CDN Cloudinary..."
                      className="w-full bg-white border-2 border-black px-2 py-1 text-[11px] font-mono text-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Lineup & Visibility Settings */}
              <div className="p-3 bg-[#FEF08A] border-3 border-black space-y-2.5 shadow-[2px_2px_0px_0px_#000]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFeaturedCheck"
                      checked={isFeaturedLineup}
                      onChange={(e) => setIsFeaturedLineup(e.target.checked)}
                      className="w-4 h-4 accent-black cursor-pointer"
                    />
                    <label htmlFor="isFeaturedCheck" className="text-xs font-black text-black cursor-pointer uppercase flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-black fill-black" />
                      <span>FEATURED PADA HOMEPAGE LINEUP</span>
                    </label>
                  </div>

                  {isFeaturedLineup && (
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-black text-black">URUTAN:</label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={lineupOrder}
                        onChange={(e) => setLineupOrder(parseInt(e.target.value, 10) || 1)}
                        className="w-14 bg-white border-2 border-black p-1 text-xs text-center font-black"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t-2 border-black">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-black text-black cursor-pointer uppercase">
                    AKTIFKAN VISIBILITAS DI WEBSITE (PUBLIK)
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white text-black text-xs font-black uppercase border-3 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-zinc-100 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-black text-xs font-black uppercase border-3 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "MENYIMPAN KE NEON DB..." : "SAVE DATA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Pure Neo-Brutalism Delete Confirmation Modal */}
      {deleteComedianId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-mono">
          <div className="bg-white border-4 border-black max-w-sm w-full p-6 shadow-[8px_8px_0px_0px_#000] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500 border-3 border-black text-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                <AlertTriangle className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-black">HAPUS KOMIKA?</h3>
                <p className="text-xs text-zinc-600 font-bold mt-0.5">
                  Record profil akan dihapus permanen dari tabel comedians Neon.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t-3 border-black flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteComedianId(null)}
                className="flex-1 py-2.5 bg-white text-black text-xs font-black uppercase border-3 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-zinc-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                BATAL
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase border-3 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "MENGHAPUS..." : "HAPUS PERMANEN"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => {
          setIsPickerOpen(false);
          setPickerTargetComedianId(null);
        }}
        onSelect={handleSelectFromStorage}
        defaultType="HEADSHOT"
        title="Pilih Foto Komika Dari Media Storage"
      />
    </div>
  );
}
