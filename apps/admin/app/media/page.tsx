"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Filter,
  Trash2,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { initialMediaAssets, MediaAsset, uploadAsset } from "../../src/lib/mock-data";

export default function MediaAssetsAdminPage() {
  const [assets, setAssets] = useState<MediaAsset[]>(initialMediaAssets);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredAssets = assets.filter(
    (a) => selectedType === "ALL" || a.type === selectedType
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const res = await uploadAsset(file);
      const newAsset: MediaAsset = {
        id: `med-${Date.now()}`,
        name: file.name,
        type: file.name.includes("headshot")
          ? "HEADSHOT"
          : file.name.includes("flyer")
          ? "FLYER"
          : "BANNER",
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: res.url,
        uploadedAt: new Date().toISOString().split("T")[0] || "2026-10-01",
      };
      setAssets((prev) => [newAsset, ...prev]);
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus aset media ini dari storage?")) {
      setAssets((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Media & Asset Storage
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Penyimpanan grafis hero banner, flyer jadwal open mic, dan headshot komika (Siap migrasi ke Supabase Storage)
          </p>
        </div>

        <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold tracking-wider transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>Upload File Baru</span>
          <input type="file" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-gray-200 p-4 shadow-xs flex flex-wrap gap-2">
        {["ALL", "BANNER", "FLYER", "HEADSHOT", "DOCUMENTATION"].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              selectedType === type
                ? "bg-gray-900 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Media Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white border border-gray-200 shadow-xs flex flex-col justify-between overflow-hidden group hover:border-gray-400 transition-all"
          >
            {/* Visual Box */}
            <div className="h-44 bg-gray-900 flex flex-col justify-between p-3 relative overflow-hidden">
              <div className="flex justify-between items-start z-10">
                <span className="px-2 py-0.5 bg-white/90 text-gray-900 text-[10px] font-bold uppercase tracking-wider">
                  {asset.type}
                </span>
                <span className="text-[10px] text-white/70 font-mono">
                  {asset.size}
                </span>
              </div>

              <div className="my-auto text-center z-10">
                <ImageIcon className="w-8 h-8 text-white/40 mx-auto mb-1" />
                <span className="text-[11px] text-white font-mono block px-2 truncate">
                  {asset.name}
                </span>
              </div>

              <div className="text-[10px] text-white/50 z-10">
                Uploaded: {asset.uploadedAt}
              </div>
            </div>

            {/* Asset Actions */}
            <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => handleCopyUrl(asset.id, asset.url)}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
              >
                {copiedId === asset.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">
                      Copied!
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(asset.id)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Hapus Aset"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
