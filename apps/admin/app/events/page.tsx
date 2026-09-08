"use client";

import { useState } from "react";
import {
  Calendar,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Upload,
} from "lucide-react";
import {
  initialEvents,
  EventItem,
  uploadAsset,
} from "../../src/lib/mock-data";

export default function EventsAdminPage() {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"OPEN MIC" | "SPECIAL SHOW">("OPEN MIC");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [host, setHost] = useState("");
  const [price, setPrice] = useState("");
  const [taptapUrl, setTaptapUrl] = useState("");
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT" | "TAPTAP LIVE">("PUBLISHED");
  const [flyerName, setFlyerName] = useState<string>("");

  const filteredEvents = events.filter((evt) => {
    const matchStatus = filterStatus === "ALL" || evt.status === filterStatus;
    const matchSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.host.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle("");
    setType("OPEN MIC");
    setDate("2026-10-25");
    setTime("20:00 WIT");
    setVenue("SKY COFFEE25");
    setAddress("Jl. Bhayangkara, Koperapoka, Timika");
    setHost("RIAN 'THE HAMMER'");
    setPrice("FREE ENTRY");
    setTaptapUrl("");
    setStatus("PUBLISHED");
    setFlyerName("");
    setIsModalOpen(true);
  };

  const openEditModal = (evt: EventItem) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setType(evt.type);
    setDate(evt.date);
    setTime(evt.time);
    setVenue(evt.venue);
    setAddress(evt.address);
    setHost(evt.host);
    setPrice(evt.price);
    setTaptapUrl(evt.taptapUrl);
    setStatus(evt.status);
    setFlyerName(evt.flyerUrl || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((item) =>
          item.id === editingEvent.id
            ? {
                ...item,
                title,
                type,
                date,
                time,
                venue,
                address,
                host,
                price,
                taptapUrl,
                status,
                flyerUrl: flyerName,
              }
            : item
        )
      );
    } else {
      const newEvent: EventItem = {
        id: `evt-${Date.now()}`,
        title,
        type,
        date,
        time,
        venue,
        address,
        host,
        price,
        taptapUrl,
        status,
        flyerUrl: flyerName,
        capacity: type === "OPEN MIC" ? 50 : 200,
        registeredCount: 0,
      };
      setEvents((prev) => [newEvent, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus acara ini dari kalender?")) {
      setEvents((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSimulateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const res = await uploadAsset(file);
      setFlyerName(res.path);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Events Management</h2>
          <p className="text-xs text-gray-500 mt-1">
            Kelola jadwal Open Mic, pertunjukan spesial, dan integrasi tautan TapTap
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold tracking-wider transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Show Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {["ALL", "PUBLISHED", "TAPTAP LIVE", "DRAFT"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                filterStatus === st
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Cari nama acara, venue, host..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 px-3 py-2 pl-9 text-xs text-gray-900 focus:outline-none focus:border-gray-900"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Events Table (DESIGN-SYSTEM: ONLY horizontal row dividers) */}
      <div className="bg-white border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                  Event Title
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                  Schedule
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                  Location / Venue
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                  TapTap Link
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                  Status
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-gray-500">
                    Tidak ada jadwal acara yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    className="border-b border-gray-200 hover:bg-gray-50/75 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sm text-gray-900">
                        {evt.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        <span className="font-medium text-gray-700">{evt.type}</span> • Host: {evt.host}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-gray-900">
                        {evt.date}
                      </div>
                      <div className="text-xs text-gray-500">{evt.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-gray-900">
                        {evt.venue}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {evt.address}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {evt.taptapUrl ? (
                        <a
                          href={evt.taptapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                        >
                          <span>TapTap Live</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">Belum diset</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                          evt.status === "TAPTAP LIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : evt.status === "PUBLISHED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {evt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(evt)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          title="Edit Show"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(evt.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus Show"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Form Tambah/Edit Show */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 max-w-lg w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                {editingEvent ? "Edit Show" : "Tambah Show Baru"}
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
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Judul Acara
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: THE GRIND VOL. 43"
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Tipe Show
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
                  >
                    <option value="OPEN MIC">OPEN MIC</option>
                    <option value="SPECIAL SHOW">SPECIAL SHOW</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Status Tayang
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="TAPTAP LIVE">TAPTAP LIVE</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Jam Acara
                  </label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="20:00 WIT"
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Nama Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="SKY COFFEE25"
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Host / MC
                  </label>
                  <input
                    type="text"
                    required
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="RIAN 'THE HAMMER'"
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Alamat Venue
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Bhayangkara, Koperapoka, Timika"
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Harga / Tiket
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="FREE ENTRY / RP 75.000"
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    External Link TapTap
                  </label>
                  <input
                    type="url"
                    value={taptapUrl}
                    onChange={(e) => setTaptapUrl(e.target.value)}
                    placeholder="https://taptap.id/e/..."
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              {/* Upload Flyer Mock */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Flyer Event (Asset Upload Mock)
                </label>
                <div className="border border-dashed border-gray-300 p-3 bg-gray-50 flex items-center justify-between">
                  <span className="text-gray-500 truncate max-w-xs">
                    {flyerName || "Belum ada file dipilih"}
                  </span>
                  <label className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleSimulateUpload}
                    />
                  </label>
                </div>
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
                  Simpan Acara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
