"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Upload,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { EventItem } from "../../src/lib/mock-data";

export default function EventsAdminPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  // Load events from Neon DB API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
    setDate(new Date().toISOString().split("T")[0] || "2026-10-01");
    setTime("20:00 WIT");
    setVenue("SKY COFFEE25");
    setAddress("Jl. Bhayangkara, Koperapoka, Timika");
    setHost("RIAN 'THE HAMMER'");
    setPrice("FREE ENTRY");
    setTaptapUrl("");
    setStatus("PUBLISHED");
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
    setTaptapUrl(evt.taptapUrl || "");
    setStatus(evt.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: Partial<EventItem> = {
        id: editingEvent ? editingEvent.id : `evt-${Date.now()}`,
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
        capacity: type === "OPEN MIC" ? 60 : 250,
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchEvents();
        setIsModalOpen(false);
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menyimpan event");
      }
    } catch (err) {
      console.error("Save event error:", err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (evt: EventItem) => {
    const nextStatusMap: Record<string, "PUBLISHED" | "TAPTAP LIVE" | "DRAFT"> = {
      PUBLISHED: "TAPTAP LIVE",
      "TAPTAP LIVE": "DRAFT",
      DRAFT: "PUBLISHED",
    };
    const nextStatus = nextStatusMap[evt.status] || "PUBLISHED";

    // Optimistic update
    setEvents((prev) =>
      prev.map((item) => (item.id === evt.id ? { ...item, status: nextStatus } : item))
    );

    try {
      const res = await fetch("/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: evt.id, status: nextStatus }),
      });
      if (!res.ok) {
        await fetchEvents();
      }
    } catch {
      await fetchEvents();
    }
  };

  const confirmDelete = async () => {
    if (!deleteEventId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events?id=${deleteEventId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((item) => item.id !== deleteEventId));
        setDeleteEventId(null);
      }
    } catch (err) {
      console.error("Delete event error:", err);
      alert("Gagal menghapus event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">Events Management</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
              NEON DB CONNECTED
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Kelola jadwal Open Mic, pertunjukan spesial, dan integrasi tiket TapTap langsung di Neon.tech
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchEvents}
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
            <span>+ CREATE EVENT</span>
          </button>
        </div>
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

      {/* Events Table */}
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
                  Status (Click to Toggle)
                </th>
                <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-400" />
                    <span>Memuat data acara dari Neon PostgreSQL...</span>
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
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
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(evt)}
                        title="Klik untuk ubah status secara instan"
                        className={`inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${
                          evt.status === "TAPTAP LIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : evt.status === "PUBLISHED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {evt.status} ↻
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(evt)}
                          className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteEventId(evt.id)}
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

      {/* Modal Form Tambah/Edit Show */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 max-w-lg w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                {editingEvent ? "Edit Show" : "+ CREATE NEW EVENT"}
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
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Nama Acara / Judul Show
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: THE GRIND VOL. 43"
                  className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Tipe Acara
                  </label>
                  <select
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value as "OPEN MIC" | "SPECIAL SHOW")
                    }
                    className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                  >
                    <option value="OPEN MIC">OPEN MIC</option>
                    <option value="SPECIAL SHOW">SPECIAL SHOW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as "PUBLISHED" | "DRAFT" | "TAPTAP LIVE"
                      )
                    }
                    className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="TAPTAP LIVE">TAPTAP LIVE</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Waktu / Jam
                  </label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="20:00 WIT"
                    className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Nama Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="SKY COFFEE25"
                    className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Host / MC
                  </label>
                  <input
                    type="text"
                    required
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="RIAN 'THE HAMMER'"
                    className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Alamat Lengkap Venue
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Bhayangkara, Koperapoka, Timika"
                  className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Harga Tiket
                  </label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="FREE ENTRY / Rp 50.000"
                    className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Tautan TapTap / RSVP (Opsional)
                  </label>
                  <input
                    type="text"
                    value={taptapUrl}
                    onChange={(e) => setTaptapUrl(e.target.value)}
                    placeholder="https://taptap.id/e/... (Kosongkan jika belum ada)"
                    className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-gray-900"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    * Kosongkan atau beri strip (-) jika tiket belum rilis. Di web akan otomatis tampil badge merah &quot;COMING SOON&quot;.
                  </p>
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
                  {isSubmitting ? "Menyimpan ke Neon DB..." : "Simpan Acara"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteEventId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Konfirmasi Hapus</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tindakan ini permanen dan akan menghapus record dari Neon DB.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteEventId(null)}
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
    </div>
  );
}
