"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Phone,
  Search,
  Filter,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface Member {
  id: string;
  name: string;
  role: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE";
  joinedDate: string;
}

export default function MembersAdminPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form inputs
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [formJoinedDate, setFormJoinedDate] = useState("");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Action status notification
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/members");
      if (!res.ok) throw new Error("Gagal mengambil data member dari server.");
      const data = await res.json();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data member");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormName("");
    setFormRole("");
    setFormPhone("");
    setFormStatus("ACTIVE");
    setFormJoinedDate(new Date().toISOString().split("T")[0] || "");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setFormName(m.name);
    setFormRole(m.role);
    setFormPhone(m.phone || "");
    setFormStatus(m.status);
    setFormJoinedDate(m.joinedDate || new Date().toISOString().split("T")[0] || "");
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRole.trim()) {
      alert("Nama dan Role / Jabatan wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: editingMember ? editingMember.id : undefined,
        name: formName.trim(),
        role: formRole.trim(),
        phone: formPhone.trim(),
        status: formStatus,
        joinedDate: formJoinedDate,
      };

      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan data member.");
      }

      setIsFormOpen(false);
      showNotice(
        editingMember
          ? `Data member ${formName} berhasil diperbarui!`
          : `Member baru ${formName} berhasil ditambahkan!`
      );
      await fetchMembers();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (m: Member) => {
    const nextStatus = m.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch("/api/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: m.id, status: nextStatus }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui status.");

      setMembers((prev) =>
        prev.map((item) => (item.id === m.id ? { ...item, status: nextStatus } : item))
      );
      showNotice(`Status ${m.name} diubah menjadi ${nextStatus}.`);
    } catch (err: any) {
      alert(err.message || "Gagal mengubah status member.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/members?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus member.");

      setDeleteTarget(null);
      showNotice(`Member ${deleteTarget.name} berhasil dihapus.`);
      await fetchMembers();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus member.");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered members
  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.phone && m.phone.includes(searchQuery));
    const matchStatus =
      statusFilter === "ALL" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#FF4500]" />
            <span>Member & Pengurus Management</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Data terhubung langsung ke PostgreSQL Neon. Kelola struktur pengurus, kurator open mic, dan anggota aktif.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchMembers}
            disabled={loading}
            className="p-2 border-2 border-black bg-white hover:bg-gray-100 font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF4500] text-white border-2 border-black font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_#000000] hover:bg-[#E03E00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ ADD MEMBER</span>
          </button>
        </div>
      </div>

      {/* Notice Toast */}
      {actionNotice && (
        <div className="p-3 bg-emerald-100 border-2 border-black font-semibold text-xs text-emerald-900 shadow-[3px_3px_0px_0px_#000] animate-in fade-in duration-150">
          ✓ {actionNotice}
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, role, no. HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border-2 border-black bg-gray-50 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold uppercase px-3 py-1.5 border-2 border-black bg-white focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">SEMUA STATUS ({members.length})</option>
            <option value="ACTIVE">ACTIVE ({members.filter((m) => m.status === "ACTIVE").length})</option>
            <option value="INACTIVE">INACTIVE ({members.filter((m) => m.status === "INACTIVE").length})</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000000] overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-black bg-[#FFE9E3]">
              <th className="px-6 py-3.5 text-black font-['Space_Mono',monospace] uppercase font-bold tracking-wider">
                Nama Pengurus
              </th>
              <th className="px-6 py-3.5 text-black font-['Space_Mono',monospace] uppercase font-bold tracking-wider">
                Role / Jabatan
              </th>
              <th className="px-6 py-3.5 text-black font-['Space_Mono',monospace] uppercase font-bold tracking-wider">
                Kontak / No. HP
              </th>
              <th className="px-6 py-3.5 text-black font-['Space_Mono',monospace] uppercase font-bold tracking-wider">
                Bergabung Sejak
              </th>
              <th className="px-6 py-3.5 text-black font-['Space_Mono',monospace] uppercase font-bold tracking-wider">
                Status Akses
              </th>
              <th className="px-6 py-3.5 text-right text-black font-['Space_Mono',monospace] uppercase font-bold tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#FF4500]" />
                    <span className="font-mono text-xs">Memuat data dari database Neon...</span>
                  </div>
                </td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <p className="font-mono text-sm font-bold text-gray-700">Tidak ada member ditemukan.</p>
                  <p className="text-xs text-gray-500 mt-1">Coba sesuaikan pencarian atau tambahkan member baru.</p>
                </td>
              </tr>
            ) : (
              filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 text-sm">{m.name}</div>
                    <div className="text-[10px] font-mono text-gray-400">ID: {m.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block bg-gray-100 border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-800">
                      {m.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {m.phone ? (
                      <div className="flex items-center gap-1.5 font-mono text-gray-700">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{m.phone}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600">
                    {m.joinedDate || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(m)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ${
                        m.status === "ACTIVE"
                          ? "bg-emerald-400 text-black hover:bg-emerald-500"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      title="Klik untuk toggle status"
                    >
                      {m.status === "ACTIVE" ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>ACTIVE</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>INACTIVE</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 bg-white border-2 border-black hover:bg-yellow-300 shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-colors active:translate-y-0.5"
                        title="Edit Member"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(m)}
                        className="p-1.5 bg-white border-2 border-black text-red-600 hover:bg-red-500 hover:text-white shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-colors active:translate-y-0.5"
                        title="Hapus Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal (Create / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border-4 border-black p-6 max-w-lg w-full shadow-[8px_8px_0px_0px_#000000] relative">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
              <h3 className="font-['Space_Mono',monospace] font-bold text-base text-gray-900 uppercase">
                {editingMember ? "Edit Data Member" : "+ Tambah Member / Pengurus Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-gray-500 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Amin Hidayat"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black text-xs font-medium focus:bg-yellow-50 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Role / Jabatan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Divisi Acara & Kurator Open Mic"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black text-xs font-medium focus:bg-yellow-50 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    No. Handphone / WA
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +62 812-3456-7890"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black text-xs font-medium focus:bg-yellow-50 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Tanggal Bergabung
                  </label>
                  <input
                    type="date"
                    value={formJoinedDate}
                    onChange={(e) => setFormJoinedDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black text-xs font-medium focus:bg-yellow-50 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Status Akses
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                  className="w-full px-3 py-2 border-2 border-black text-xs font-bold focus:outline-hidden cursor-pointer bg-white"
                >
                  <option value="ACTIVE">ACTIVE (Aktif Bertugas)</option>
                  <option value="INACTIVE">INACTIVE (Nonaktif / Pasif)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-gray-100 mt-6">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border-2 border-black font-bold text-xs uppercase tracking-wider hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#FF4500] text-white border-2 border-black font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:bg-[#E03E00] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingMember ? "Simpan Perubahan" : "Tambah Member"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border-4 border-black p-6 max-w-md w-full shadow-[8px_8px_0px_0px_#000000] relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 border-2 border-black flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-['Space_Mono',monospace] font-bold text-base text-gray-900 uppercase">
                  Konfirmasi Hapus Member
                </h3>
                <p className="text-xs text-gray-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus data member{" "}
              <strong className="text-black font-bold">"{deleteTarget.name}"</strong> ({deleteTarget.role}) dari database?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-gray-100">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border-2 border-black font-bold text-xs uppercase tracking-wider hover:bg-gray-100 cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white border-2 border-black font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:bg-red-700 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Hapus Member</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
