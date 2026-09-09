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
} from "lucide-react";
import { ComedianItem } from "../../src/lib/mock-data";
import MediaPickerModal from "../../src/components/MediaPickerModal";

export default function ComediansAdminPage() {
  const [comedians, setComedians] = useState<ComedianItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredComedians = comedians.filter(
    (c) =>
      c.stageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.realName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.comedyStyle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStatus = async (c: ComedianItem) => {
    const nextActive = !c.isActive;
    // Optimistic UI update
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

  // Replace Photo action directly from table row
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

      // Update DB with new avatar URL
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">
              Comedians Roster Directory
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
              NEON DB CONNECTED
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Data komika resmi StandUp INDO Timika, punchline, dan status visibilitas web langsung dari Neon DB
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchComedians}
            className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors shadow-xs"
            title="Refresh Data dari DB"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold tracking-wider transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD COMEDIAN</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white border border-gray-200 p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Cari nama panggung, nama asli, gaya..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 px-3 py-2 pl-9 text-xs text-gray-900 focus:outline-none focus:border-gray-900"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {filteredComedians.length} Komika Terdaftar
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                  Talent Profile
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                  Style
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                  Punchline Signature
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                  Featured Lineup
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                  Open Mic Sets
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                  Visibility (Click to Toggle)
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && comedians.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-400" />
                    <span>Memuat daftar komika dari Neon PostgreSQL...</span>
                  </td>
                </tr>
              ) : filteredComedians.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-xs text-gray-500">
                    Tidak ada komika yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredComedians.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-200 hover:bg-gray-50/75 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full bg-gray-100 border border-gray-300 overflow-hidden shrink-0 flex items-center justify-center text-gray-400 font-bold text-xs">
                          {c.avatarUrl ? (
                            <Image
                              src={c.avatarUrl}
                              alt={c.stageName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            c.stageName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-900">
                            {c.stageName}
                          </div>
                          <div className="text-xs text-gray-500">{c.realName}</div>
                          <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{c.phone}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {c.comedyStyle}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <p className="text-xs text-gray-600 line-clamp-2 italic">
                        &quot;{c.punchline}&quot;
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {c.isFeaturedLineup ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <Star className="w-3.5 h-3.5 text-[#FF4500] fill-[#FF4500]" />
                          <span>#{c.lineupOrder || 1} LINEUP</span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-mono">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-gray-900">
                        {c.totalOpenMic} Sets
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(c)}
                        title="Klik untuk ubah visibilitas komika di landing page"
                        className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border transition-colors cursor-pointer ${
                          c.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {c.isActive ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Active on Web</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Storage Picker (Anti-Duplication) */}
                        <button
                          type="button"
                          onClick={() => {
                            setPickerTargetComedianId(c.id);
                            setIsPickerOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-[#FFF8F6] hover:bg-yellow-200 text-gray-900 border border-black transition-colors flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_0px_#000]"
                          title="Pilih foto dari Cloudinary Storage tanpa upload baru"
                        >
                          <Images className="w-3.5 h-3.5 text-[#FF4500]" />
                          <span>Storage</span>
                        </button>

                        {/* Replace Photo Quick Button */}
                        <label
                          className="px-2.5 py-1 text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Upload Baru Foto Komika ke Cloudinary"
                        >
                          {uploadingComedianId === c.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" />
                          ) : (
                            <Camera className="w-3.5 h-3.5 text-gray-500" />
                          )}
                          <span>
                            {uploadingComedianId === c.id ? "Uploading..." : "Upload"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingComedianId === c.id}
                            onChange={(e) => handleQuickPhotoUpload(c.id, e)}
                            className="hidden"
                          />
                        </label>

                        {/* Edit Profile */}
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Comedian */}
                        <button
                          type="button"
                          onClick={() => setDeleteComedianId(c.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah/Edit Komika */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                {editingComedian ? "Edit Profile Komika" : "+ ADD COMEDIAN"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Nama Panggung (Stage Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="Misal: RIAN"
                    className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Nama Asli
                  </label>
                  <input
                    type="text"
                    required
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    placeholder="Misal: Rian S."
                    className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Gaya Komedi
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
                    className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                  >
                    <option value="Observational">Observational</option>
                    <option value="Storytelling">Storytelling</option>
                    <option value="Dark Comedy">Dark Comedy</option>
                    <option value="Absurd">Absurd</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Total Open Mic
                  </label>
                  <input
                    type="number"
                    value={totalOpenMic}
                    onChange={(e) => setTotalOpenMic(Number(e.target.value))}
                    className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Punchline Signature / Quote Khas
                </label>
                <input
                  type="text"
                  required
                  value={punchline}
                  onChange={(e) => setPunchline(e.target.value)}
                  placeholder="Punchline signature yang muncul di web"
                  className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Bio Singkat
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Karakter dan keresahan panggung komika..."
                  className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  No. WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+628..."
                  className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                />
              </div>

              {/* Photo Asset Management (Anti-Duplication / Single Source of Truth) */}
              <div className="border-2 border-black p-3 bg-gray-50 space-y-2">
                <label className="block text-xs font-bold text-gray-900 uppercase font-['Space_Mono',monospace]">
                  Foto Headshot Komika
                </label>
                <div className="flex items-center gap-3">
                  {/* Photo Preview */}
                  <div className="relative w-16 h-16 bg-white border-2 border-black overflow-hidden shrink-0 flex items-center justify-center">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Avatar preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPickerTargetComedianId(null);
                          setIsPickerOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-[#FFF8F6] hover:bg-yellow-200 text-gray-900 border border-black text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-[2px_2px_0px_0px_#000]"
                      >
                        <Images className="w-3.5 h-3.5 text-[#FF4500]" />
                        <span>Pilih Dari Storage</span>
                      </button>

                      <label className="px-2.5 py-1.5 bg-black hover:bg-[#FF4500] text-white border border-black text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-[2px_2px_0px_0px_#000]">
                        {isUploadingPhoto ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingPhoto ? "Uploading..." : "Upload Baru"}</span>
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
                          className="px-2 py-1 text-xs text-red-600 hover:text-white hover:bg-red-600 border border-transparent hover:border-black transition-colors"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="URL Cloudinary atau pilih dari storage..."
                      className="w-full bg-white border border-gray-300 px-2 py-1 text-[11px] font-mono text-gray-700 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Lineup & Visibility Settings */}
              <div className="p-3 bg-amber-50 border border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFeaturedCheck"
                      checked={isFeaturedLineup}
                      onChange={(e) => setIsFeaturedLineup(e.target.checked)}
                      className="w-4 h-4 text-[#FF4500]"
                    />
                    <label htmlFor="isFeaturedCheck" className="text-xs font-bold text-gray-900 cursor-pointer flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[#FF4500] fill-[#FF4500]" />
                      <span>Tampilkan di THE LINEUP (Homepage)</span>
                    </label>
                  </div>

                  {isFeaturedLineup && (
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-semibold text-gray-700">Urutan:</label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={lineupOrder}
                        onChange={(e) => setLineupOrder(parseInt(e.target.value, 10) || 1)}
                        className="w-16 bg-white border border-gray-300 p-1 text-xs text-center font-bold"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-amber-200">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-gray-900"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-semibold text-gray-700">
                    Tampilkan komika di Halaman Publik Web (Aktif)
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Profil Komika"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteComedianId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Hapus Komika?</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Profil komika akan dihapus permanen dari database Neon.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteComedianId(null)}
                className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={confirmDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Menghapus..." : "Hapus Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Media Storage Picker Modal (Anti-Duplication) */}
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
