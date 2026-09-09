"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  Images,
  Image as ImageIcon,
  Clock,
  MapPin,
  Ticket,
} from "lucide-react";
import { EventItem } from "../../src/lib/mock-data";
import MediaPickerModal from "../../src/components/MediaPickerModal";

// Helper function: Check if event date has passed according to WIT (Papua / UTC+9)
function isEventPassedWIT(dateStr: string, timeStr?: string): boolean {
  if (!dateStr) return false;
  try {
    const nowWIT = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jayapura",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    if (dateStr < nowWIT) return true;
    if (dateStr > nowWIT) return false;

    if (timeStr) {
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch && timeMatch[1] && timeMatch[2]) {
        const eventHours = parseInt(timeMatch[1], 10);
        const eventMinutes = parseInt(timeMatch[2], 10);
        const nowWITTime = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Jayapura",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date());
        const parts = nowWITTime.split(":").map(Number);
        const nowH = parts[0] ?? 0;
        const nowM = parts[1] ?? 0;
        if (nowH > eventHours || (nowH === eventHours && nowM >= eventMinutes)) {
          return true;
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}

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
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT" | "TAPTAP LIVE" | "CLOSED">("PUBLISHED");
  const [flyerUrl, setFlyerUrl] = useState<string>("");

  // Media Picker and upload states
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isUploadingFlyer, setIsUploadingFlyer] = useState(false);

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
    const isPassed = isEventPassedWIT(evt.date, evt.time);
    let matchStatus = true;

    if (filterStatus === "ALL") {
      matchStatus = true;
    } else if (filterStatus === "UPCOMING") {
      matchStatus = !isPassed && evt.status !== "CLOSED";
    } else if (filterStatus === "EXPIRED") {
      matchStatus = isPassed;
    } else if (filterStatus === "CLOSED") {
      matchStatus = evt.status === "CLOSED";
    } else {
      matchStatus = evt.status === filterStatus;
    }

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
    setDate("");
    setTime("20:00 WIT");
    setVenue("");
    setAddress("");
    setHost("");
    setPrice("FREE ENTRY");
    setTaptapUrl("");
    setStatus("PUBLISHED");
    setFlyerUrl("");
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
    setStatus(evt.status || "PUBLISHED");
    setFlyerUrl(evt.flyerUrl || "");
    setIsModalOpen(true);
  };

  const handleFlyerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFlyer(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "stup-timika/flyers");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFlyerUrl(data.url);
      } else {
        alert("Gagal mengunggah flyer.");
      }
    } catch (err) {
      console.error("Upload flyer error:", err);
      alert("Terjadi kesalahan saat upload.");
    } finally {
      setIsUploadingFlyer(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        id: editingEvent ? editingEvent.id : `evt-${Date.now()}`,
        title,
        type,
        date,
        time,
        venue,
        address,
        host,
        price,
        taptapUrl: taptapUrl || "-",
        status,
        flyerUrl: flyerUrl || undefined,
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

  const handleStatusChange = async (
    id: string,
    nextStatus: "PUBLISHED" | "DRAFT" | "TAPTAP LIVE" | "CLOSED"
  ) => {
    setEvents((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );

    try {
      const res = await fetch("/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (!res.ok) await fetchEvents();
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

  const renderTimingBadge = (dateStr: string, timeStr?: string, taptapUrl?: string | null) => {
    const isPassed = isEventPassedWIT(dateStr, timeStr);
    if (isPassed) {
      return (
        <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-black uppercase bg-zinc-300 text-black border-2 border-black line-through shadow-[1px_1px_0px_0px_#000]">
          EXPIRED
        </span>
      );
    }

    const hasTicket =
      taptapUrl &&
      taptapUrl.trim() &&
      taptapUrl.trim() !== "-" &&
      taptapUrl.trim() !== "#" &&
      (taptapUrl.startsWith("http://") || taptapUrl.startsWith("https://"));

    if (!hasTicket) {
      return (
        <div className="flex items-center gap-1">
          <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-black uppercase bg-[#22C55E] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]">
            UPCOMING
          </span>
          <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-black uppercase bg-red-500 text-white border border-black rotate-[-2deg]">
            NO TAPTAP
          </span>
        </div>
      );
    }

    return (
      <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-black uppercase bg-[#22C55E] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]">
        UPCOMING
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl md:text-2xl font-black font-mono tracking-tight uppercase text-black">
              EVENTS & SCHEDULE MANAGEMENT
            </h1>
            <span className="px-2.5 py-1 text-xs font-black font-mono bg-[#FFD700] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              {events.length} TOTAL SHOWS
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-600 mt-1">
            Kelola jadwal Open Mic mingguan, special show komika, tiket TapTap, dan arsip pertunjukan di Neon DB
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchEvents}
            className="p-2.5 bg-white border-3 border-black text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            title="Refresh Data dari DB"
          >
            <RefreshCw className={`w-4 h-4 stroke-[2.5] ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF4500] hover:bg-[#E03E00] text-white text-xs font-black font-mono uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ CREATE EVENT</span>
          </button>
        </div>
      </div>

      {/* 2. Status Filters & Search Bar */}
      <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Pill Balok Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", label: "ALL" },
            { id: "UPCOMING", label: "UPCOMING" },
            { id: "EXPIRED", label: "EXPIRED" },
            { id: "CLOSED", label: "CLOSED" },
            { id: "DRAFT", label: "DRAFT" },
          ].map((tab) => {
            const isSelected = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-mono font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer ${
                  isSelected
                    ? "bg-black text-white shadow-[3px_3px_0px_0px_#FFD700] -translate-x-0.5 -translate-y-0.5"
                    : "bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input Box */}
        <div className="relative w-full lg:w-72">
          <input
            type="text"
            placeholder="CARI ACARA, VENUE, HOST..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FDFBF7] border-3 border-black px-3.5 py-2 pl-9 text-xs font-mono font-bold text-black uppercase placeholder:text-zinc-400 placeholder:font-bold focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
          />
          <Search className="w-4 h-4 text-black stroke-[3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 3. Neo-Brutalist Table / Mobile Cards */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] overflow-hidden">
        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="bg-black text-white border-b-4 border-black">
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider">
                  EVENT TITLE & TYPE
                </th>
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider">
                  DATE & SCHEDULE
                </th>
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider">
                  VENUE & LOCATION
                </th>
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider">
                  TICKET / TAPTAP
                </th>
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider">
                  STATUS ACARA
                </th>
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-wider text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-zinc-600 font-mono">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-black" />
                    <span className="font-bold">MEMUAT JADWAL ACARA DARI NEON POSTGRESQL...</span>
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-zinc-600 font-mono font-bold">
                    TIDAK ADA JADWAL ACARA YANG SESUAI FILTER.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    className="border-b-2 border-black hover:bg-yellow-50 transition-colors"
                  >
                    {/* Title & Type */}
                    <td className="px-5 py-3.5">
                      <div className="font-black text-sm text-black tracking-tight uppercase">
                        {evt.title}
                      </div>
                      <div className="text-xs text-zinc-600 font-semibold mt-0.5 flex items-center gap-2">
                        <span className="bg-[#FFD700] text-black px-1.5 py-0.2 border border-black font-black text-[10px]">
                          {evt.type}
                        </span>
                        <span>HOST: {evt.host}</span>
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-black">
                          {evt.date}
                        </span>
                        {renderTimingBadge(evt.date, evt.time, evt.taptapUrl)}
                      </div>
                      <div className="text-xs text-zinc-500 font-bold mt-0.5">{evt.time}</div>
                    </td>

                    {/* Venue */}
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="text-xs font-black text-black uppercase">
                        {evt.venue}
                      </div>
                      <div className="text-[11px] text-zinc-600 font-medium truncate">
                        {evt.address}
                      </div>
                    </td>

                    {/* TapTap / Ticket */}
                    <td className="px-5 py-3.5">
                      {evt.taptapUrl && evt.taptapUrl !== "-" && evt.taptapUrl !== "#" ? (
                        <a
                          href={evt.taptapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFD700] text-black border border-black text-xs font-black uppercase hover:bg-black hover:text-[#FFD700] shadow-[1px_1px_0px_0px_#000] transition-colors"
                        >
                          <span>TAPTAP LIVE</span>
                          <ExternalLink className="w-3 h-3 stroke-[3]" />
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-400 font-bold">NO TICKET URL</span>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-5 py-3.5">
                      <select
                        value={evt.status}
                        onChange={(e) =>
                          handleStatusChange(
                            evt.id,
                            e.target.value as "PUBLISHED" | "DRAFT" | "TAPTAP LIVE" | "CLOSED"
                          )
                        }
                        className={`px-2.5 py-1 text-xs font-mono font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer focus:outline-none transition-colors ${
                          evt.status === "CLOSED" || evt.status?.toLowerCase() === "closed"
                            ? "bg-zinc-300 text-black line-through"
                            : evt.status === "TAPTAP LIVE"
                            ? "bg-[#22C55E] text-black"
                            : evt.status === "PUBLISHED"
                            ? "bg-[#FFD700] text-black"
                            : "bg-white text-zinc-600"
                        }`}
                      >
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="TAPTAP LIVE">TAPTAP LIVE</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="DRAFT">DRAFT</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(evt)}
                          className="p-1.5 bg-white hover:bg-[#FEF08A] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                          title="Edit Acara"
                        >
                          <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteEventId(evt.id)}
                          className="p-1.5 bg-red-500 hover:bg-red-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                          title="Hapus Acara"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
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
          {loading && events.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-zinc-600">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-black" />
              MEMUAT DATA ACARA...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-6 text-center text-xs font-bold text-zinc-600">
              TIDAK ADA ACARA YANG SESUAI FILTER.
            </div>
          ) : (
            filteredEvents.map((evt) => (
              <div key={evt.id} className="p-4 bg-white space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="bg-[#FFD700] text-black px-1.5 py-0.2 border border-black font-black text-[10px]">
                      {evt.type}
                    </span>
                    <h3 className="font-black text-base text-black uppercase mt-1">
                      {evt.title}
                    </h3>
                  </div>
                  {renderTimingBadge(evt.date, evt.time, evt.taptapUrl)}
                </div>

                <div className="text-xs space-y-1 text-zinc-800">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#FF4500]" />
                    <span>{evt.date} • {evt.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-zinc-600">
                    <MapPin className="w-3.5 h-3.5 text-black" />
                    <span>{evt.venue} ({evt.address})</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <Ticket className="w-3.5 h-3.5 text-black" />
                    <span>{evt.price}</span>
                  </div>
                </div>

                <div className="pt-2 border-t-2 border-black flex items-center justify-between gap-2">
                  <select
                    value={evt.status}
                    onChange={(e) =>
                      handleStatusChange(
                        evt.id,
                        e.target.value as "PUBLISHED" | "DRAFT" | "TAPTAP LIVE" | "CLOSED"
                      )
                    }
                    className="px-2 py-1 text-xs font-mono font-black uppercase border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="TAPTAP LIVE">TAPTAP LIVE</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(evt)}
                      className="px-3 py-1 bg-white hover:bg-yellow-200 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                    >
                      EDIT
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteEventId(evt.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
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

      {/* 4. Pure Neo-Brutalism Form Modal (Add / Edit Event) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-mono">
          <div className="bg-white border-4 border-black p-6 max-w-lg w-full shadow-[8px_8px_0px_0px_#000] max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#FF4500] text-white border-3 border-black p-3.5 mb-5 flex items-center justify-between shadow-[3px_3px_0px_0px_#000]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 stroke-[3]" />
                <h3 className="text-sm md:text-base font-black uppercase tracking-wider">
                  {editingEvent ? "EDIT EVENT JADWAL" : "+ CREATE NEW EVENT"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-black text-white hover:bg-white hover:text-black border-2 border-black transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-black uppercase mb-1">
                  JUDUL ACARA *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="MISAL: THE GRIND VOL. 43"
                  className="w-full bg-[#FDFBF7] border-2 border-black p-2.5 text-xs font-mono font-bold uppercase focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    TIPE PERTUNJUKAN
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "OPEN MIC" | "SPECIAL SHOW")}
                    className="w-full bg-white border-2 border-black p-2.5 text-xs font-mono font-bold uppercase focus:outline-none focus:shadow-[3px_3px_0px_0px_#000] cursor-pointer"
                  >
                    <option value="OPEN MIC">OPEN MIC</option>
                    <option value="SPECIAL SHOW">SPECIAL SHOW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    STATUS PUBLIKASI
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as "PUBLISHED" | "DRAFT" | "TAPTAP LIVE" | "CLOSED"
                      )
                    }
                    className="w-full bg-white border-2 border-black p-2.5 text-xs font-mono font-bold uppercase focus:outline-none focus:shadow-[3px_3px_0px_0px_#000] cursor-pointer"
                  >
                    <option value="PUBLISHED">PUBLISHED (Aktif)</option>
                    <option value="TAPTAP LIVE">TAPTAP LIVE (Tiket)</option>
                    <option value="CLOSED">CLOSED / SELESAI</option>
                    <option value="DRAFT">DRAFT (Sembunyi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    TANGGAL ACARA *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#FDFBF7] border-2 border-black p-2.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    WAKTU / JAM *
                  </label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="20:00 WIT"
                    className="w-full bg-[#FDFBF7] border-2 border-black p-2.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    NAMA VENUE *
                  </label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="SKY COFFEE25"
                    className="w-full bg-[#FDFBF7] border-2 border-black p-2.5 text-xs font-mono font-bold uppercase focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    HOST / MC *
                  </label>
                  <input
                    type="text"
                    required
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="RIAN 'THE HAMMER'"
                    className="w-full bg-[#FDFBF7] border-2 border-black p-2.5 text-xs font-mono font-bold uppercase focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-black uppercase mb-1">
                  ALAMAT LENGKAP VENUE *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Bhayangkara, Timika"
                  className="w-full bg-[#FDFBF7] border-2 border-black p-2.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    HARGA TIKET / HTM
                  </label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="FREE ENTRY / Rp 50.000"
                    className="w-full bg-[#FDFBF7] border-2 border-black p-2.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    LINK TIKET TAPTAP / RSVP
                  </label>
                  <input
                    type="text"
                    value={taptapUrl}
                    onChange={(e) => setTaptapUrl(e.target.value)}
                    placeholder="https://taptap.id/e/..."
                    className="w-full bg-[#FDFBF7] border-2 border-black p-2.5 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
                  />
                </div>
              </div>

              {/* Flyer Asset Box */}
              <div className="border-3 border-black p-3.5 bg-[#FFFDF9] space-y-2 shadow-[2px_2px_0px_0px_#000]">
                <label className="block text-xs font-black text-black uppercase">
                  POSTER / FLYER ACARA
                </label>

                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-20 bg-white border-2 border-black overflow-hidden shrink-0 flex items-center justify-center shadow-[1px_1px_0px_0px_#000]">
                    {flyerUrl ? (
                      <Image
                        src={flyerUrl}
                        alt="Flyer preview"
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
                        onClick={() => setIsPickerOpen(true)}
                        className="px-2.5 py-1.5 bg-[#FFD700] hover:bg-[#FFE55C] text-black border-2 border-black text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        <Images className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>PILIH STORAGE</span>
                      </button>

                      <label className="px-2.5 py-1.5 bg-black hover:bg-[#FF4500] text-white border-2 border-black text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer">
                        {isUploadingFlyer ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                        <span>{isUploadingFlyer ? "UPLOADING..." : "UPLOAD FILE"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingFlyer}
                          onChange={handleFlyerUpload}
                          className="hidden"
                        />
                      </label>

                      {flyerUrl && (
                        <button
                          type="button"
                          onClick={() => setFlyerUrl("")}
                          className="px-2 py-1 text-[11px] font-black text-red-600 hover:bg-red-500 hover:text-white border border-black transition-colors"
                        >
                          HAPUS
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={flyerUrl}
                      onChange={(e) => setFlyerUrl(e.target.value)}
                      placeholder="URL CDN Cloudinary..."
                      className="w-full bg-white border-2 border-black px-2 py-1 text-[11px] font-mono text-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Submit Buttons */}
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
                  className="flex-2 py-3 bg-[#FF4500] hover:bg-[#E03E00] text-white text-xs font-black uppercase border-3 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "MENYIMPAN KE NEON DB..." : "SAVE DATA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Pure Neo-Brutalism Delete Confirmation Modal */}
      {deleteEventId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-mono">
          <div className="bg-white border-4 border-black max-w-sm w-full p-6 shadow-[8px_8px_0px_0px_#000] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500 border-3 border-black text-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                <AlertTriangle className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-black">HAPUS ACARA INI?</h3>
                <p className="text-xs text-zinc-600 font-bold mt-0.5">
                  Jadwal acara akan dihapus permanen dari tabel events Neon PostgreSQL.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t-3 border-black flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteEventId(null)}
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
                {isSubmitting ? "MENGHAPUS..." : "HAPUS SEKARANG"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(asset) => setFlyerUrl(asset.url)}
        defaultType="FLYER"
        title="Pilih Flyer Acara Dari Media Storage"
      />
    </div>
  );
}
