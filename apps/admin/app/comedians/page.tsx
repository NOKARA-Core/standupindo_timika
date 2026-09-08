"use client";

import { useState } from "react";
import { Mic2, Plus, Search, Check, X, Phone, Edit2, Trash2 } from "lucide-react";
import { initialComedians, ComedianItem } from "../../src/lib/mock-data";

export default function ComediansAdminPage() {
  const [comedians, setComedians] = useState<ComedianItem[]>(initialComedians);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComedian, setEditingComedian] = useState<ComedianItem | null>(null);

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

  const filteredComedians = comedians.filter(
    (c) =>
      c.stageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.realName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.comedyStyle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setComedians((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
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
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingComedian) {
      setComedians((prev) =>
        prev.map((item) =>
          item.id === editingComedian.id
            ? {
                ...item,
                realName,
                stageName,
                comedyStyle,
                punchline,
                bio,
                phone,
                totalOpenMic,
                isActive,
              }
            : item
        )
      );
    } else {
      const newComedian: ComedianItem = {
        id: `com-${Date.now()}`,
        realName,
        stageName,
        comedyStyle,
        punchline,
        bio,
        phone,
        totalOpenMic,
        isActive,
      };
      setComedians((prev) => [newComedian, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus komika ini dari database roster?")) {
      setComedians((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Comedians Roster Directory
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Data komika resmi StandUp INDO Timika, punchline, dan status visibilitas web
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold tracking-wider transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Komika Baru</span>
        </button>
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

      {/* Table (DESIGN-SYSTEM: ONLY horizontal row dividers) */}
      <div className="bg-white border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                  Stage Name & Info
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                  Style
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                  Punchline Signature
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                  Open Mic Count
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                  Web Visibility
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredComedians.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-200 hover:bg-gray-50/75 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-gray-900">
                      {c.stageName}
                    </div>
                    <div className="text-xs text-gray-500">{c.realName}</div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{c.phone}</span>
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
                    <span className="text-xs font-bold text-gray-900">
                      {c.totalOpenMic} Sets
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => toggleStatus(c.id)}
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
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        title="Edit Komika"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus Komika"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                {editingComedian ? "Edit Data Komika" : "Tambah Komika Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Nama Panggung (Stage Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="Contoh: RIAN"
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Nama Lengkap Asli
                  </label>
                  <input
                    type="text"
                    required
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    placeholder="Rian Hidayat"
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Gaya Komedi
                  </label>
                  <select
                    value={comedyStyle}
                    onChange={(e) => setComedyStyle(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
                  >
                    <option value="Observational">Observational</option>
                    <option value="Storytelling">Storytelling</option>
                    <option value="Dark Comedy">Dark Comedy</option>
                    <option value="Absurd">Absurd</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62812..."
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Punchline Signature
                </label>
                <input
                  type="text"
                  required
                  value={punchline}
                  onChange={(e) => setPunchline(e.target.value)}
                  placeholder="Kutipan punchline singkat komika..."
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Bio / Deskripsi Profil
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Latar belakang materi dan perjalanan komika..."
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-gray-900"
                  />
                  <span className="font-semibold text-gray-700">
                    Tampilkan di Roster Landing Page (/talents)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold cursor-pointer"
                >
                  Simpan Komika
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
