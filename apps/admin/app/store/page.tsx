"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Plus,
  Search,
  Check,
  X,
  Edit2,
  Trash2,
  Upload,
  RefreshCw,
  AlertTriangle,
  Loader2,
  DollarSign,
  Package,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import { MerchItem } from "../api/merchandise/route";

const CATEGORIES = ["ALL", "T-Shirt", "Hoodie", "Aksesoris", "Tiket"] as const;

export default function StoreAdminPage() {
  const [items, setItems] = useState<MerchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MerchItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [sellingItemId, setSellingItemId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("T-Shirt");
  const [price, setPrice] = useState<number>(150000);
  const [stock, setStock] = useState<number>(20);
  const [badge, setBadge] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Image upload staging
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4500);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/merchandise");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to load merchandise:", err);
      showToast("Gagal memuat katalog merchandise", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "ALL" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.badge && item.badge.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Stats calculation
  const totalProducts = items.length;
  const totalStockCount = items.reduce((acc, i) => acc + (i.stock || 0), 0);
  const totalInventoryValue = items.reduce(
    (acc, i) => acc + (i.price || 0) * (i.stock || 0),
    0
  );
  const lowStockCount = items.filter((i) => (i.stock || 0) <= 5).length;

  const openCreateModal = () => {
    setEditingItem(null);
    setName("");
    setCategory("T-Shirt");
    setPrice(150000);
    setStock(25);
    setBadge("");
    setDescription("");
    setImageUrl("");
    setImagePreview(null);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MerchItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setStock(item.stock);
    setBadge(item.badge || "");
    setDescription(item.description || "");
    setImageUrl(item.imageUrl || "");
    setImagePreview(item.imageUrl || null);
    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    // Upload directly to Cloudinary
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "stup-timika/merch");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Gagal upload gambar ke Cloudinary");
      }

      setImageUrl(data.url);
      setImagePreview(data.url);
      showToast("Foto produk berhasil diunggah ke Cloudinary!");
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah foto produk.");
      setImagePreview(editingItem?.imageUrl || null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Nama produk merchandise wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: editingItem?.id,
        name: name.trim(),
        category: category.trim(),
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        badge: badge.trim() || null,
        description: description.trim() || null,
        imageUrl: imageUrl.trim() || null,
        isActive,
      };

      const method = editingItem ? "PUT" : "POST";
      const res = await fetch("/api/merchandise", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan item merchandise");
      }

      setIsModalOpen(false);
      await fetchItems();
      showToast(
        editingItem
          ? `Produk "${name}" berhasil diperbarui!`
          : `Produk "${name}" berhasil ditambahkan ke katalog!`
      );
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat menyimpan produk");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItemId) return;
    try {
      const res = await fetch(`/api/merchandise?id=${deleteItemId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus produk");
      }
      setItems((prev) => prev.filter((i) => i.id !== deleteItemId));
      setDeleteItemId(null);
      showToast("Item merchandise berhasil dihapus!");
    } catch (err: any) {
      alert(err.message || "Gagal menghapus produk");
    }
  };

  // Quick Action: MARK AS SOLD / RECORD TO FINANCE
  const handleMarkAsSold = async (item: MerchItem) => {
    if (item.stock <= 0) {
      alert(`Stok "${item.name}" sudah 0! Tidak dapat menandai terjual.`);
      return;
    }

    const confirmMsg = `Konfirmasi Penjualan:\n- Item: ${item.name}\n- Harga: Rp ${item.price.toLocaleString("id-ID")}\n\nStok akan berkurang -1 dan pemasukan Rp ${item.price.toLocaleString("id-ID")} akan otomatis tercatat di modul Finance. Lanjutkan?`;
    if (!confirm(confirmMsg)) return;

    setSellingItemId(item.id);
    try {
      const res = await fetch(`/api/merchandise/${item.id}/sell`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses penjualan merchandise");
      }

      // Optimistically update stock in UI
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, stock: Math.max(0, i.stock - 1) } : i
        )
      );

      showToast(data.message || `1 unit "${item.name}" terjual dicatat ke Finance!`);
    } catch (err: any) {
      alert(err.message || "Gagal mencatat penjualan ke finance");
    } finally {
      setSellingItemId(null);
    }
  };

  const toggleStatus = async (item: MerchItem) => {
    const nextActive = !item.isActive;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isActive: nextActive } : i))
    );

    try {
      await fetch("/api/merchandise", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isActive: nextActive }),
      });
    } catch {
      fetchItems();
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div
          className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between font-mono text-xs font-bold transition-all ${
            feedbackMessage.type === "success"
              ? "bg-[#10B981] text-black"
              : "bg-red-500 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="p-1 hover:bg-black hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Neo-Brutalist */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-black text-white font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5">
            INVENTORY & CASHFLOW
          </div>
          <h1 className="font-['Anton',sans-serif] text-3xl md:text-4xl text-gray-900 uppercase tracking-wide">
            MERCHANDISE & STORE
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Katalog produk resmi komunitas, stok inventaris, dan relasi kas otomatis ke Finance saat terjual.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchItems}
            className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-gray-100 cursor-pointer"
            title="Refresh katalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#FF4500] hover:bg-black text-white font-mono text-xs font-bold tracking-wider uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD MERCH ITEM</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="font-mono text-[10px] font-bold uppercase">TOTAL PRODUK</span>
            <ShoppingBag className="w-4 h-4 text-black" />
          </div>
          <div className="font-['Anton',sans-serif] text-3xl text-gray-900">
            {totalProducts}
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">
            Katalog aktif & non-aktif
          </div>
        </div>

        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="font-mono text-[10px] font-bold uppercase">TOTAL STOK FISIK</span>
            <Package className="w-4 h-4 text-[#FF4500]" />
          </div>
          <div className="font-['Anton',sans-serif] text-3xl text-gray-900">
            {totalStockCount} <span className="text-sm font-sans font-normal text-gray-500">Pcs</span>
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">
            Semua item tersedia
          </div>
        </div>

        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="font-mono text-[10px] font-bold uppercase">ESTIMASI VALUASI</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-['Anton',sans-serif] text-2xl md:text-3xl text-emerald-700">
            Rp {(totalInventoryValue / 1000).toLocaleString("id-ID")}k
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">
            Nilai nominal total stok
          </div>
        </div>

        <div className="bg-[#FFF8F6] border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="font-mono text-[10px] font-bold uppercase text-red-600">STOK MENIPIS / HABIS</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="font-['Anton',sans-serif] text-3xl text-red-600">
            {lowStockCount}
          </div>
          <div className="text-[10px] text-gray-600 font-mono mt-1">
            Perlu restock segera (≤ 5)
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 font-mono text-xs font-bold uppercase border-2 border-black transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-black text-white shadow-[2px_2px_0px_0px_#000]"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="CARI MERCHANDISE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-black px-3 py-2 pl-9 font-mono text-xs text-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white font-mono text-[11px] uppercase tracking-wider border-b-2 border-black">
                <th className="p-3 w-16 text-center">Foto</th>
                <th className="p-3">Nama Produk & Deskripsi</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Harga</th>
                <th className="p-3 text-center">Stok</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Aksi & Catat Finance</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF4500]" />
                    Memuat katalog produk dari database...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">
                    Belum ada produk merchandise yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLowStock = item.stock <= 5;
                  const isOutOfStock = item.stock <= 0;
                  const isSelling = sellingItemId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-amber-50/50 transition-colors"
                    >
                      {/* Image Thumbnail */}
                      <td className="p-3 text-center align-middle">
                        <div className="w-12 h-12 bg-gray-100 border border-black relative overflow-hidden flex items-center justify-center mx-auto">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-contain p-1"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </td>

                      {/* Product Name & Description */}
                      <td className="p-3 align-middle max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className="px-1.5 py-0.2 bg-black text-white font-mono text-[9px] font-bold uppercase">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        )}
                        <span className="text-[10px] text-gray-400 font-mono">
                          ID: {item.id}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="p-3 align-middle">
                        <span className="px-2 py-0.5 bg-gray-100 border border-black font-mono text-[10px] font-bold uppercase">
                          {item.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-3 align-middle whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-[#10B981] text-black font-mono text-xs font-bold border border-black shadow-[1px_1px_0px_0px_#000]">
                          Rp {item.price.toLocaleString("id-ID")}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="p-3 align-middle text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 font-mono text-xs font-bold border ${
                            isOutOfStock
                              ? "bg-red-500 text-white border-black"
                              : isLowStock
                              ? "bg-amber-300 text-black border-black"
                              : "bg-emerald-100 text-emerald-900 border-emerald-400"
                          }`}
                        >
                          {item.stock} {isOutOfStock ? "HABIS" : "Pcs"}
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="p-3 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => toggleStatus(item)}
                          className={`px-2 py-0.5 font-mono text-[10px] font-bold border border-black cursor-pointer transition-colors ${
                            item.isActive
                              ? "bg-emerald-400 text-black"
                              : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {item.isActive ? "AKTIF" : "OFF"}
                        </button>
                      </td>

                      {/* Actions & Mark As Sold */}
                      <td className="p-3 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* MARK AS SOLD / RECORD TO FINANCE Button */}
                          <button
                            type="button"
                            disabled={isOutOfStock || isSelling}
                            onClick={() => handleMarkAsSold(item)}
                            className={`px-2.5 py-1 font-mono text-[10px] font-bold uppercase border border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 transition-all cursor-pointer ${
                              isOutOfStock
                                ? "bg-gray-200 text-gray-400 border-gray-400 cursor-not-allowed shadow-none"
                                : "bg-[#10B981] hover:bg-emerald-500 text-black active:translate-x-[1px] active:translate-y-[1px]"
                            }`}
                            title="Tandai 1 unit terjual dan otomatis rekam pemasukan di Finance"
                          >
                            {isSelling ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3" />
                            )}
                            <span>SOLD → FINANCE</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 bg-white hover:bg-amber-100 border border-black shadow-[1px_1px_0px_0px_#000] text-gray-800 cursor-pointer"
                            title="Edit data item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteItemId(item.id)}
                            className="p-1.5 bg-white hover:bg-red-500 hover:text-white border border-black shadow-[1px_1px_0px_0px_#000] text-red-600 cursor-pointer transition-colors"
                            title="Hapus produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#FF4500]" />
                <h3 className="font-['Anton',sans-serif] text-xl text-gray-900 uppercase">
                  {editingItem ? "EDIT MERCHANDISE" : "+ ADD MERCH ITEM"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 border border-black hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1">
                  Nama Item Merchandise *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 'LIVE RAW' HEAVYWEIGHT TEE"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-black p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
                />
              </div>

              {/* Category & Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase mb-1">
                    Kategori *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-black p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
                  >
                    <option value="T-Shirt">T-Shirt</option>
                    <option value="Hoodie">Hoodie</option>
                    <option value="Aksesoris">Aksesoris</option>
                    <option value="Tiket">Tiket</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BESTSELLER, LIMITED"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-black p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
                  />
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase mb-1">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    placeholder="150000"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-gray-50 border-2 border-black p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase mb-1">
                    Jumlah Stok (Pcs) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="25"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-gray-50 border-2 border-black p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1">
                  Deskripsi / Spesifikasi
                </label>
                <textarea
                  rows={2}
                  placeholder="Material bahan, sablon, detail ukuran..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-black p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
                />
              </div>

              {/* Image Upload / Staging with Cloudinary */}
              <div className="border-2 border-black p-3 bg-gray-50 space-y-2">
                <label className="block text-xs font-mono font-bold uppercase">
                  Foto Produk (Cloudinary CDN)
                </label>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white border border-black relative overflow-hidden flex items-center justify-center shrink-0">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-black hover:bg-[#FF4500] text-white text-xs font-mono font-bold border border-black cursor-pointer shadow-[2px_2px_0px_0px_#000]">
                      {isUploadingImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isUploadingImage ? "UPLOADING..." : "UPLOAD KE CLOUDINARY"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        className="hidden"
                        onChange={handleImageFileChange}
                      />
                    </label>
                    <p className="text-[10px] text-gray-500 font-mono">
                      Rasio 1:1 Square (Transparan PNG / JPG max 2MB).
                    </p>
                  </div>
                </div>

                {imageUrl && (
                  <div className="text-[10px] text-gray-600 font-mono truncate pt-1 border-t border-gray-200">
                    URL: {imageUrl}
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 border-2 border-black"
                />
                <label
                  htmlFor="isActiveCheck"
                  className="text-xs font-mono font-bold cursor-pointer"
                >
                  TAMPILKAN DI LANDING PAGE PUBLIK (/store)
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border-2 border-black text-xs font-mono font-bold hover:bg-gray-100"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="px-5 py-2 bg-black hover:bg-[#FF4500] text-white font-mono text-xs font-bold border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{editingItem ? "SIMPAN PERUBAHAN" : "TAMBAHKAN PRODUK"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteItemId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-['Anton',sans-serif] text-xl uppercase">
                HAPUS MERCHANDISE?
              </h3>
            </div>
            <p className="text-xs text-gray-600 font-mono leading-relaxed">
              Produk ini akan dihapus permanen dari basis data Neon PostgreSQL. Aksi ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteItemId(null)}
                className="px-3 py-1.5 border border-black font-mono text-xs font-bold hover:bg-gray-100"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold border border-black shadow-[2px_2px_0px_0px_#000]"
              >
                YA, HAPUS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
