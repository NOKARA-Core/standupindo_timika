"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Mic2, AlertCircle, Calendar } from "lucide-react";

export interface MonthlyEventItem {
  monthLabel: string;
  totalShows: number;
  openMicShows: number;
  specialShows: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const totalShows = payload.find((p) => p.dataKey === "totalShows")?.value ?? 0;
    const openMicShows = payload.find((p) => p.dataKey === "openMicShows")?.value ?? 0;
    const specialShows = payload.find((p) => p.dataKey === "specialShows")?.value ?? 0;

    return (
      <div className="bg-white border-2 border-black p-3 text-xs font-mono shadow-[3px_3px_0px_0px_#000] min-w-[200px]">
        <p className="font-black text-gray-900 border-b-2 border-black pb-1 mb-2 uppercase">
          Bulan: {label}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-gray-900 font-bold">
              <span className="w-2.5 h-2.5 bg-gray-900 shrink-0 border border-black" />
              <span>Total Acara:</span>
            </span>
            <span className="font-black text-black">{totalShows} Shows</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[#FF4500] font-bold">
              <span className="w-2.5 h-2.5 bg-[#FF4500] shrink-0 border border-black" />
              <span>Open Mic Reguler:</span>
            </span>
            <span className="font-black text-[#FF4500]">{openMicShows} Show</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-purple-700 font-bold">
              <span className="w-2.5 h-2.5 bg-purple-600 shrink-0 border border-black" />
              <span>Special Shows:</span>
            </span>
            <span className="font-black text-purple-700">{specialShows} Show</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function EventActivityChart({ data }: { data: MonthlyEventItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#000] h-full flex flex-col justify-between">
        <div className="pb-4 border-b-2 border-black">
          <h2 className="text-sm font-black uppercase font-mono tracking-wider text-gray-900">
            Aktivitas Open Mic & Event (Riil Neon DB)
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Tren pementasan panggung komedi StandUp INDO Timika
          </p>
        </div>
        <div className="my-12 p-8 text-center bg-[#FFF8F6] border-2 border-dashed border-gray-300">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs font-mono font-bold text-gray-700">
            Belum Ada Data Jadwal Panggung
          </p>
          <p className="text-[11px] font-mono text-gray-500 mt-1">
            Buat jadwal open mic atau special show di modul Events untuk melihat grafik aktivitas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#000]">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4500]" />
            <h2 className="text-sm font-black uppercase font-mono tracking-wider text-gray-900">
              Aktivitas Open Mic & Event Komunitas (Kurator View)
            </h2>
          </div>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Visualisasi intensitas panggung dari tabel <code>events</code> Neon DB
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#FF4500] border border-black" />
            <span className="text-gray-700">Open Mic (Bar)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-purple-600 border border-black" />
            <span className="text-gray-700">Special Shows (Bar)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-gray-900 border border-black" />
            <span className="text-gray-700">Total (Area)</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-6 w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="eventGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#18181B" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#18181B" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />

            <XAxis
              dataKey="monthLabel"
              tickLine={false}
              axisLine={{ stroke: "#000000", strokeWidth: 2 }}
              tick={{ fill: "#000000", fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}
              dy={8}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "monospace" }}
              tickFormatter={(v) => `${v} show`}
              dx={-6}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="totalShows"
              name="Total Shows"
              stroke="#18181B"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#eventGradient)"
            />

            <Bar
              dataKey="openMicShows"
              name="Open Mic"
              fill="#FF4500"
              stroke="#000000"
              strokeWidth={1.5}
              radius={[2, 2, 0, 0]}
              maxBarSize={28}
            />

            <Bar
              dataKey="specialShows"
              name="Special Show"
              fill="#8B5CF6"
              stroke="#000000"
              strokeWidth={1.5}
              radius={[2, 2, 0, 0]}
              maxBarSize={28}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs font-mono text-gray-500">
        <span className="flex items-center gap-1.5 text-purple-700 font-bold">
          <Calendar className="w-3.5 h-3.5" />
          <span>Metrik kurasi kreatif aktif</span>
        </span>
        <span>Menampilkan {data.length} periode bulan</span>
      </div>
    </div>
  );
}
