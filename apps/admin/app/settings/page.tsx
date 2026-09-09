"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Building,
  Download,
  Database,
  Users,
  Plus,
  Trash2,
  Lock,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function SettingsAdminPage() {
  const [activeTab, setActiveTab] = useState<"general" | "backup" | "users">("general");

  // Backup state
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // User form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("superadmin");
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const handleDownloadBackup = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) throw new Error("Gagal mengekspor database");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      a.download = `stup_timika_backup_${timestamp}.sql`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setIsBackupModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Gagal mengunduh backup");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);
    setIsSubmittingUser(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUserFormError(data.error || "Gagal menambahkan user admin");
        return;
      }

      await fetchUsers();
      setIsUserModalOpen(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
    } catch {
      setUserFormError("Terjadi gangguan jaringan saat membuat user");
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      const res = await fetch(`/api/users?id=${deleteUserId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteUserId));
        setDeleteUserId(null);
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus user");
      }
    } catch {
      alert("Terjadi kesalahan jaringan");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Settings & System Management
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Pusat kendali operasional, backup database PostgreSQL (.sql), dan manajemen akun pengguna admin
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-semibold uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === "general"
              ? "border-black text-black font-bold"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          General & Operations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("backup")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === "backup"
              ? "border-[#FF4500] text-[#FF4500] font-bold"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Database Backup (.sql)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === "users"
              ? "border-black text-black font-bold"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Admin Team & Access</span>
        </button>
      </div>

      {/* TAB 1: General & Operations */}
      {activeTab === "general" && (
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-full">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  StandUp INDO Timika Operations Center
                </h3>
                <p className="text-xs text-gray-500">
                  Informasi identitas resmi sekretariat dan basecamp komunitas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Nama Komunitas
                </label>
                <input
                  type="text"
                  readOnly
                  value="StandUp INDO Timika"
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Wilayah Chapter
                </label>
                <input
                  type="text"
                  readOnly
                  value="Kabupaten Mimika, Papua Tengah"
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 font-medium"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-gray-700 mb-1">
                Basecamp Resmi (HQ)
              </label>
              <input
                type="text"
                readOnly
                value="SKY COFFEE25, Jl. Bhayangkara, Koperapoka, Timika"
                className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 font-medium"
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-full">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Persetujuan & Kurasi Panggung
                </h3>
                <p className="text-xs text-gray-500">
                  Standar operasional kurasi panggung open mic mingguan
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Setiap pendaftar Open Mic baru wajib melalui tahap verifikasi line-up di menu <strong>Dashboard</strong> atau <strong>Events</strong> sebelum nama komika dipublikasikan ke jadwal penonton.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Email Kontak Pengurus
                </label>
                <input
                  type="text"
                  readOnly
                  value="standupindotimika@gmail.com"
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  WhatsApp Admin
                </label>
                <input
                  type="text"
                  readOnly
                  value="+62 812-3456-7890"
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Database Backup (.sql) */}
      {activeTab === "backup" && (
        <div className="space-y-6">
          {/* Card Neo-Brutalist: DATABASE BACKUP & EXPORT */}
          <div className="bg-[#FFF8F6] border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000000] space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#FF4500] border-2 border-black flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 bg-black text-white font-mono text-[10px] font-bold uppercase tracking-widest">
                  NEON POSTGRESQL CLOUD
                </span>
                <h3 className="font-['Anton',sans-serif] text-2xl md:text-3xl text-gray-900 uppercase tracking-wide mt-1">
                  DATABASE BACKUP & EXPORT
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed max-w-2xl">
                  Ekspor seluruh data aktif komunitas StandUp INDO Timika ke file script dump SQL murni (.sql). Mencakup data jadwal acara (events), profil komika roster (comedians), pendaftaran open mic, konfigurasi dynamic media assets, dan akun admin users.
                </p>
              </div>
            </div>

            <div className="bg-white border-2 border-black p-4 text-xs font-mono space-y-2">
              <div className="text-gray-700 font-bold uppercase">
                Tabel yang Disertakan dalam Dump Backup:
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>public.events</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>public.comedians</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>public.open_mic_registrations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>public.media_assets</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>public.site_assets_config</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>public.admin_users</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsBackupModalOpen(true)}
                className="px-6 py-3.5 bg-black hover:bg-[#FF4500] text-white hover:text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-black shadow-[6px_6px_0px_0px_#FF4500] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>BACKUP DATABASE (.SQL)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Admin Users Management */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Admin Team & Access Control
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Daftar akun administrator yang memiliki hak otorisasi login ke panel admin
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchUsers}
                className="p-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors shadow-xs"
                title="Refresh Daftar User"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? "animate-spin" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserFormError(null);
                  setIsUserModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold tracking-wider transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ ADD NEW ADMIN</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                      Nama Administrator
                    </th>
                    <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                      Username / Email
                    </th>
                    <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                      Role / Hak Akses
                    </th>
                    <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                      Tanggal Dibuat
                    </th>
                    <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loadingUsers && users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-xs text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-gray-400" />
                        <span>Memuat data pengguna...</span>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-xs text-gray-500">
                        Belum ada user admin terdaftar.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/75 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-sm text-gray-900">{u.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 w-fit border border-gray-200">
                            {u.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setDeleteUserId(u.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Cabut Hak Akses Akun"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Konfirmasi Download Backup .sql */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black max-w-md w-full p-6 shadow-[8px_8px_0px_0px_#000000] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#FF4500] border-2 border-black flex items-center justify-center text-white shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-gray-900">
                  Konfirmasi Backup Database
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Apakah Anda yakin ingin mengekspor seluruh data database saat ini ke file <code className="font-bold text-black">.sql</code>?
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  File dump akan diunduh langsung ke media penyimpanan perangkat Anda.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-black flex items-center justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                disabled={isDownloading}
                onClick={() => setIsBackupModalOpen(false)}
                className="px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 text-gray-900 font-bold uppercase transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDownloading}
                onClick={handleDownloadBackup}
                className="px-4 py-2 border-2 border-black bg-black hover:bg-[#FF4500] text-white font-bold uppercase transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengekspor...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Ya, Download Backup</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Tambah User Admin Baru */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black max-w-md w-full p-6 shadow-[8px_8px_0px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-gray-900">
                + ADD NEW ADMIN USER
              </h3>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {userFormError && (
              <div className="p-2.5 bg-red-100 border border-red-300 text-red-700 text-xs font-semibold">
                {userFormError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Misal: Dimas Organizer"
                  className="w-full border-2 border-black p-2 bg-[#FFF8F6] focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Username / Email Login
                </label>
                <input
                  type="text"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Misal: dimas"
                  className="w-full border-2 border-black p-2 bg-[#FFF8F6] focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Password Akun
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-2 border-black p-2 bg-[#FFF8F6] focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Role / Otoritas
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full border-2 border-black p-2 bg-[#FFF8F6] focus:outline-none focus:bg-white"
                >
                  <option value="superadmin">SUPERADMIN (FULL ACCESS)</option>
                  <option value="curator">CURATOR (EVENTS & TALENTS ONLY)</option>
                </select>
              </div>

              <div className="pt-3 border-t-2 border-black flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 font-bold uppercase transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-4 py-2 border-2 border-black bg-black hover:bg-[#FF4500] text-white font-bold uppercase transition-colors disabled:opacity-50"
                >
                  {isSubmittingUser ? "Menyimpan..." : "Simpan Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Konfirmasi Hapus User */}
      {deleteUserId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-red-600 max-w-sm w-full p-6 shadow-[8px_8px_0px_0px_#000000] space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-gray-900 uppercase">Cabut Hak Akses?</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Akun ini tidak akan bisa login kembali ke panel admin.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setDeleteUserId(null)}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
