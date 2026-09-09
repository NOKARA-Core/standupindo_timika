"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { Package, AlertCircle } from "lucide-react";

export interface MerchCategoryItem {
  name: string;
  value: number; // total stock
  itemCount: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Aksesoris: "#FF4500",
  Tiket: "#10B981",
  "T-Shirt": "#18181B",
  Hoodie: "#F59E0B",
  Lainnya: "#6B7280",
};

const FALLBACK_PALETTE = ["#FF4500", "#10B981", "#18181B", "#F59E0B", "#8B5CF6", "#3B82F6"];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

function CustomPieTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length > 0 && payload[0]?.payload) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border-2 border-black p-2.5 text-xs font-mono shadow-[3px_3px_0px_0px_#000]">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 shrink-0 border border-black"
            style={{ backgroundColor: data.fill }}
          />
          <span className="font-black text-gray-900 uppercase">{data.name}</span>
        </div>
        <div className="text-gray-600 text-[11px] space-y-0.5">
          <div>
            Stok: <span className="font-bold text-black">{data.value} pcs</span>
          </div>
          <div>
            Varian: <span className="font-bold text-black">{data.itemCount} produk</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function ContentMerchDistChart({
  data,
  totalStock,
}: {
  data: MerchCategoryItem[];
  totalStock: number;
}) {
  if (!data || data.length === 0 || totalStock <= 0) {
    return (
      <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#000] h-full flex flex-col justify-between">
        <div className="pb-3 border-b-2 border-black">
          <h2 className="text-sm font-black uppercase font-mono tracking-wider text-gray-900">
            Distribusi Stok Merchandise
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Komposisi inventaris per kategori katalog
          </p>
        </div>
        <div className="my-10 p-6 text-center bg-[#FFF8F6] border-2 border-dashed border-gray-300">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs font-mono font-bold text-gray-700">
            Belum Ada Stok Merchandise
          </p>
          <p className="text-[11px] font-mono text-gray-500 mt-1">
            Tambahkan produk merchandise di menu Merchandise Store.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div>
            <h2 className="text-sm font-black uppercase font-mono tracking-wider text-gray-900">
              Distribusi Kategori Merchandise
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              Proporsi stok fisik dari Neon DB
            </p>
          </div>
          <span className="text-[10px] font-bold font-mono text-white bg-black px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_#FF4500]">
            {totalStock} PCS TOTAL
          </span>
        </div>

        {/* Donut Chart with Center Text */}
        <div className="relative h-48 w-full mt-4 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={78}
                paddingAngle={3}
                dataKey="value"
                stroke="#000000"
                strokeWidth={1.5}
              >
                {data.map((entry, idx) => {
                  const color =
                    CATEGORY_COLORS[entry.name] ||
                    FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length] ||
                    "#000000";
                  return <Cell key={`cell-${entry.name}`} fill={color} />;
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Overlay Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-2xl font-black text-gray-900 font-mono tracking-tight leading-none">
              {totalStock}
            </span>
            <span className="text-[10px] uppercase font-mono font-bold text-gray-500 mt-1">
              Unit Fisik
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2">
          {data.map((item, idx) => {
            const color =
              CATEGORY_COLORS[item.name] ||
              FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length] ||
              "#000000";
            const percent = totalStock > 0 ? Math.round((item.value / totalStock) * 100) : 0;

            return (
              <div key={item.name} className="flex items-center gap-1.5 text-xs font-mono">
                <span
                  className="w-2.5 h-2.5 shrink-0 border border-black"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-700 truncate font-semibold">
                  {item.name}:
                </span>
                <span className="font-bold text-black ml-auto">
                  {percent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] font-mono text-gray-500">
        <span className="flex items-center gap-1">
          <Package className="w-3.5 h-3.5" />
          <span>{data.reduce((acc, curr) => acc + curr.itemCount, 0)} Varian Produk</span>
        </span>
      </div>
    </div>
  );
}
