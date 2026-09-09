"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  Wallet,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  transactionDate: string;
  description: string;
}

interface FinancialSummary {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
}

const CATEGORIES = [
  "Tiket Acara",
  "Merchandise",
  "Operasional Show",
  "Venue & Logistik",
  "Konsumsi",
  "Kas Komunitas",
  "Sponsorship",
  "Lainnya",
];

export default function FinancesAdminPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    currentBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    transactionCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [formType, setFormType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [formCategory, setFormCategory] = useState("Tiket Acara");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Notice toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const fetchFinances = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/finances");
      if (!res.ok) throw new Error("Gagal mengambil data keuangan.");
      const data = await res.json();
      setTransactions(data.transactions || []);
      setSummary(
        data.summary || {
          currentBalance: 0,
          totalIncome: 0,
          totalExpense: 0,
          transactionCount: 0,
        }
      );
    } catch (err: any) {
      setError(err.message || "Gagal memuat data keuangan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, []);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingTransaction(null);
    setFormType("INCOME");
    setFormCategory("Tiket Acara");
    setFormAmount("");
    setFormDate(new Date().toISOString().split("T")[0] || "");
    setFormDescription("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setFormType(tx.type);
    setFormCategory(tx.category);
    setFormAmount(String(tx.amount));
    setFormDate(tx.transactionDate || new Date().toISOString().split("T")[0] || "");
    setFormDescription(tx.description);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Math.abs(Number(formAmount));
    if (!parsedAmount || parsedAmount <= 0) {
      alert("Masukkan nominal transaksi yang valid (> 0).");
      return;
    }
    if (!formDescription.trim()) {
      alert("Keterangan transaksi wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: editingTransaction ? editingTransaction.id : undefined,
        type: formType,
        category: formCategory,
        amount: parsedAmount,
        transactionDate: formDate,
        description: formDescription.trim(),
      };

      const res = await fetch("/api/finances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan transaksi.");
      }

      setIsFormOpen(false);
      showNotice(
        editingTransaction
          ? `Transaksi "${formDescription}" berhasil diperbarui!`
          : `Transaksi baru berhasil dicatat!`
      );
      await fetchFinances();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan transaksi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/finances?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus transaksi.");

      setDeleteTarget(null);
      showNotice(`Transaksi berhasil dihapus.`);
      await fetchFinances();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus transaksi.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === "ALL" || tx.type === typeFilter;
    const matchCategory =
      categoryFilter === "ALL" || tx.category === categoryFilter;
    return matchSearch && matchType && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-600" />
            <span>Financial Reports & Arus Kas</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Data terhubung langsung ke PostgreSQL Neon. Pencatatan kas masuk & keluar, penjualan merch, dan bagi hasil acara.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchFinances}
            disabled={loading}
            className="p-2 border-2 border-black bg-white hover:bg-gray-100 font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white border-2 border-black font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_#000000] hover:bg-emerald-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ RECORD TRANSACTION</span>
          </button>
        </div>
      </div>

      {/* Notice Toast */}
      {actionNotice && (
        <div className="p-3 bg-emerald-100 border-2 border-black font-semibold text-xs text-emerald-900 shadow-[3px_3px_0px_0px_#000] animate-in fade-in duration-150">
          ✓ {actionNotice}
        </div>
      )}

      {/* Summary Recap Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Saldo */}
        <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_#000]">
          <span className="text-xs font-['Space_Mono',monospace] font-bold text-gray-600 uppercase">
            Saldo Kas Komunitas
          </span>
          <div className="text-2xl md:text-3xl font-black font-['Space_Mono',monospace] text-gray-900 mt-2">
            {loading ? "..." : formatIDR(summary.currentBalance)}
          </div>
          <div className="text-xs text-gray-600 font-semibold mt-1 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Rekap dari {summary.transactionCount} transaksi</span>
          </div>
        </div>

        {/* Total Pemasukan */}
        <div className="bg-[#E8F8F0] border-4 border-black p-5 shadow-[6px_6px_0px_0px_#000]">
          <span className="text-xs font-['Space_Mono',monospace] font-bold text-emerald-800 uppercase">
            Total Kas Masuk (Income)
          </span>
          <div className="text-2xl md:text-3xl font-black font-['Space_Mono',monospace] text-emerald-700 mt-2">
            {loading ? "..." : formatIDR(summary.totalIncome)}
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Tiket, Merch, Iuran & Sponsor</span>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-[#FFE9E3] border-4 border-black p-5 shadow-[6px_6px_0px_0px_#000]">
          <span className="text-xs font-['Space_Mono',monospace] font-bold text-red-800 uppercase">
            Total Kas Keluar (Expense)
          </span>
          <div className="text-2xl md:text-3xl font-black font-['Space_Mono',monospace] text-red-600 mt-2">
            {loading ? "..." : formatIDR(summary.totalExpense)}
          </div>
          <div className="text-xs text-red-700 font-semibold mt-1 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Sewa Venue, Sound & Konsumsi</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi, kategori, keterangan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border-2 border-black bg-gray-50 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-500 shrink-0" />
          
          {/* Filter Tipe */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-bold uppercase px-3 py-1.5 border-2 border-black bg-white focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">SEMUA ARUS ({transactions.length})</option>
            <option value="INCOME">PEMASUKAN (INCOME)</option>
            <option value="EXPENSE">PENGELUARAN (EXPENSE)</option>
          </select>

          {/* Filter Kategori */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-bold uppercase px-3 py-1.5 border-2 border-black bg-white focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">SEMUA KATEGORI</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000000] overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="px-6 py-3.5 text-black font-['Space_Mono',monospace] uppercase font-bold tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3.5 text-black font-['Space_Mono',monospace] uppercase font-bold tracking-wider">
                Tipe
              </th>
              <th className="px-6 py-3.5 text-black font-['Space_Mono',monospace] uppercase font-bold tracking-wider">
                Kategori
              </th>
              <th className="px-6 py-3.5 text-black font-['Space_Mono',monospace] uppercase font-bold tracking-wider">
                Keterangan Transaksi
              </th>
              <th className="px-6 py-3.5 text-right text-black font-['Space_Mono',monospace] uppercase font-bold tracking-wider">
                Nominal
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
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    <span className="font-mono text-xs">Memuat laporan arus kas dari Neon DB...</span>
                  </div>
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <p className="font-mono text-sm font-bold text-gray-700">Tidak ada transaksi ditemukan.</p>
                  <p className="text-xs text-gray-500 mt-1">Gunakan tombol "+ RECORD TRANSACTION" untuk mencatat.</p>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-gray-700 whitespace-nowrap">
                    {tx.transactionDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tx.type === "INCOME" ? (
                      <span className="inline-flex items-center gap-1 font-['Space_Mono',monospace] text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-400 px-2 py-0.5">
                        <ArrowUpRight className="w-3 h-3" />
                        MASUK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-['Space_Mono',monospace] text-[10px] font-bold bg-red-100 text-red-800 border border-red-400 px-2 py-0.5">
                        <ArrowDownRight className="w-3 h-3" />
                        KELUAR
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-block bg-white border border-gray-300 font-semibold px-2.5 py-1 text-xs text-gray-800">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-xs md:max-w-md">
                    {tx.description}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap font-['Space_Mono',monospace] font-bold text-sm">
                    {tx.type === "INCOME" ? (
                      <span className="text-emerald-600">+{formatIDR(tx.amount)}</span>
                    ) : (
                      <span className="text-red-600">-{formatIDR(tx.amount)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(tx)}
                        className="p-1.5 bg-white border-2 border-black hover:bg-yellow-300 shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-colors active:translate-y-0.5"
                        title="Edit Transaksi"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(tx)}
                        className="p-1.5 bg-white border-2 border-black text-red-600 hover:bg-red-500 hover:text-white shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-colors active:translate-y-0.5"
                        title="Hapus Transaksi"
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

      {/* Transaction Modal (Record / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border-4 border-black p-6 max-w-lg w-full shadow-[8px_8px_0px_0px_#000000] relative">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
              <h3 className="font-['Space_Mono',monospace] font-bold text-base text-gray-900 uppercase">
                {editingTransaction ? "Edit Catatan Transaksi" : "+ Record Transaction (Arus Kas)"}
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
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Tipe Arus Kas *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormType("INCOME")}
                    className={`py-2 px-3 border-2 border-black font-['Space_Mono',monospace] text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formType === "INCOME"
                        ? "bg-emerald-500 text-white shadow-[3px_3px_0px_0px_#000]"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Pemasukan (Income)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType("EXPENSE")}
                    className={`py-2 px-3 border-2 border-black font-['Space_Mono',monospace] text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formType === "EXPENSE"
                        ? "bg-red-600 text-white shadow-[3px_3px_0px_0px_#000]"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Pengeluaran (Expense)</span>
                  </button>
                </div>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Jumlah Nominal (Rp) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="e.g. 1500000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black text-xs font-mono font-bold focus:bg-yellow-50 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Tanggal Transaksi *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black text-xs font-medium focus:bg-yellow-50 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Kategori *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black text-xs font-bold focus:outline-hidden cursor-pointer bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Keterangan / Deskripsi Transaksi *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Penjualan 15 Tiket Presale Open Mic #42 via TapTap"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black text-xs font-medium focus:bg-yellow-50 focus:outline-hidden resize-none"
                />
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
                  className={`px-5 py-2 text-white border-2 border-black font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all flex items-center gap-2 ${
                    formType === "INCOME"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingTransaction ? "Simpan Transaksi" : "Catat Transaksi"}</span>
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
                  Hapus Catatan Transaksi
                </h3>
                <p className="text-xs text-gray-500">Saldo kas akan otomatis dihitung ulang.</p>
              </div>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed mb-4">
              Apakah Anda yakin ingin menghapus transaksi ini?
            </p>
            <div className="p-3 bg-gray-50 border-2 border-black mb-6 font-mono text-xs">
              <div className="font-bold text-gray-900">{deleteTarget.description}</div>
              <div className="text-gray-500 mt-1">
                {deleteTarget.type} • {formatIDR(deleteTarget.amount)} • {deleteTarget.transactionDate}
              </div>
            </div>

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
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
