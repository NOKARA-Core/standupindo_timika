"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FolderOpen, X, Search, Loader2, Image as ImageIcon, Check } from "lucide-react";

export interface MediaAssetItem {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
  uploadedAt: string;
  public_id?: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: { url: string; public_id?: string; name: string }) => void;
  defaultType?: string;
  title?: string;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  defaultType = "ALL",
  title = "Pilih Gambar Dari Media Storage",
}: MediaPickerModalProps) {
  const [assets, setAssets] = useState<MediaAssetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState(defaultType);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTypeFilter(defaultType);
      setSearchQuery("");
      fetchAssets();
    }
  }, [isOpen, defaultType]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/media?all=true");
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch (err) {
      console.error("Failed to load assets in MediaPickerModal:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted || typeof document === "undefined") {
    return null;
  }

  const filteredAssets = assets.filter((asset) => {
    const matchType =
      typeFilter === "ALL" ||
      asset.type.toUpperCase() === typeFilter.toUpperCase();
    const matchSearch =
      searchQuery === "" ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.public_id || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-4 border-black p-6 md:p-8 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-[8px_8px_0px_0px_#000000] relative animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black">
          <div>
            <h3 className="font-['Space_Mono',monospace] font-bold text-base md:text-lg text-gray-900 uppercase flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-[#FF4500]" />
              <span>{title}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Gunakan aset yang sudah ada di Cloudinary untuk mencegah file duplikat (Single Source of Truth).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-black hover:bg-gray-100 border border-transparent hover:border-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-gray-200">
          <div className="flex flex-wrap gap-1.5">
            {["ALL", "HEADSHOT", "BANNER", "FLYER", "DOCUMENTATION"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`px-2.5 py-1 text-xs font-bold uppercase transition-colors cursor-pointer border ${
                  typeFilter === type
                    ? "bg-black text-white border-black shadow-[2px_2px_0px_0px_#FF4500]"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama aset / public id..."
              className="w-full bg-gray-50 border border-gray-300 px-3 py-1.5 pl-8 text-xs text-gray-900 focus:outline-none focus:border-black"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto py-4 pr-1">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500 font-mono">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF4500]" />
              <span>Memuat media dari Cloudinary storage...</span>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-mono text-xs border-2 border-dashed border-gray-300">
              <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <span>Tidak ada gambar yang cocok di storage.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id || asset.url}
                  onClick={() => {
                    onSelect({
                      url: asset.url,
                      public_id: asset.public_id || asset.id,
                      name: asset.name,
                    });
                    onClose();
                  }}
                  className="group bg-white border-2 border-black hover:border-[#FF4500] hover:shadow-[4px_4px_0px_0px_#000] transition-all cursor-pointer flex flex-col overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="h-28 bg-gray-900 relative overflow-hidden">
                    {asset.url ? (
                      <Image
                        src={asset.url}
                        alt={asset.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        No Preview
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    <div className="absolute top-1 left-1">
                      <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-bold uppercase tracking-wider">
                        {asset.type}
                      </span>
                    </div>
                  </div>

                  {/* Info & Select button */}
                  <div className="p-2 flex flex-col justify-between flex-1 bg-white">
                    <span
                      className="text-[11px] font-bold text-gray-900 truncate font-mono block"
                      title={asset.name}
                    >
                      {asset.name}
                    </span>
                    <span className="text-[9px] text-gray-500 font-mono block mt-0.5">
                      {asset.size}
                    </span>

                    <button
                      type="button"
                      className="mt-2.5 w-full py-1 text-center bg-gray-100 group-hover:bg-[#FF4500] group-hover:text-white text-[10px] font-bold uppercase border border-black transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Gunakan Gambar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t-2 border-black flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono">
            {filteredAssets.length} file tersedia di Cloudinary
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border-2 border-black font-bold text-xs uppercase hover:bg-gray-100 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
