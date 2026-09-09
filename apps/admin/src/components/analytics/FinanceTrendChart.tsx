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
import { TrendingUp, AlertCircle } from "lucide-react";

export interface MonthlyFinanceItem {
  monthLabel: string;
  income: number;
  expense: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const income = payload.find((p) => p.dataKey === "income")?.value ?? 0;
    const expense = payload.find((p) => p.dataKey === "expense")?.value ?? 0;
    const net = income - expense;

    return (
      <div className="bg-white border-2 border-black p-3 text-xs font-mono shadow-[3px_3px_0px_0px_#000] min-w-[200px]">
        <p className="font-black text-gray-900 border-b-2 border-black pb-1 mb-2 uppercase">
          Periode: {label}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <span className="w-2.5 h-2.5 bg-emerald-500 shrink-0 border border-black" />
              <span>Pemasukan:</span>
            </span>
            <span className="font-black text-emerald-700">
              Rp {Number(income).toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-red-600 font-bold">
              <span className="w-2.5 h-2.5 bg-red-500 shrink-0 border border-black" />
              <span>Pengeluaran:</span>
            </span>
            <span className="font-black text-red-600">
              Rp {Number(expense).toLocaleString("id-ID")}
            </span>
          </div>
          <div className="pt-1.5 border-t border-gray-200 flex items-center justify-between gap-3 font-bold">
            <span className="text-gray-600">Arus Kas Bersih:</span>
            <span className={net >= 0 ? "text-emerald-800" : "text-red-700"}>
              Rp {Number(net).toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function FinanceTrendChart({ data }: { data: MonthlyFinanceItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_#000] h-full flex flex-col justify-between">
        <div className="pb-4 border-b-2 border-black">
          <h2 className="text-sm font-black uppercase font-mono tracking-wider text-gray-900">
            Tren Keuangan & Penjualan (Riil Neon DB)
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Agregasi arus kas bulanan komunitas StandUp INDO Timika
          </p>
        </div>
        <div className="my-12 p-8 text-center bg-[#FFF8F6] border-2 border-dashed border-gray-300">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs font-mono font-bold text-gray-700">
            Belum Ada Riwayat Transaksi Bulanan
          </p>
          <p className="text-[11px] font-mono text-gray-500 mt-1">
            Catat transaksi kas masuk atau penjualan merchandise di modul Finances untuk melihat grafik tren.
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
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-black uppercase font-mono tracking-wider text-gray-900">
              Tren Keuangan & Penjualan (Khusus Superadmin)
            </h2>
          </div>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Agregasi arus kas bulanan riil dari tabel <code>finances</code> di Neon DB
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-emerald-500 border border-black" />
            <span className="text-gray-700">Pemasukan (Area)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-500 border border-black" />
            <span className="text-gray-700">Pengeluaran (Bar)</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-6 w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
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
              tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "monospace" }}
              tickFormatter={(v) => `Rp ${(v / 1000).toLocaleString("id-ID")}k`}
              dx={-6}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="income"
              name="Pemasukan"
              stroke="#059669"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#incomeGradient)"
            />

            <Bar
              dataKey="expense"
              name="Pengeluaran"
              fill="#EF4444"
              stroke="#000000"
              strokeWidth={1.5}
              radius={[2, 2, 0, 0]}
              maxBarSize={36}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs font-mono text-gray-500">
        <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Real-time aggregate data</span>
        </span>
        <span>Menampilkan {data.length} periode bulan terakhir</span>
      </div>
    </div>
  );
}
