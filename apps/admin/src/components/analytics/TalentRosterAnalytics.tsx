"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Mic2, Award, Zap, Users, AlertCircle, Sparkles } from "lucide-react";

export interface ComedyStyleDistItem {
  genre: string;
  count: number;
}

export interface TopPerformerItem {
  stageName: string;
  totalShows: number;
  comedyStyle: string;
}

export interface TalentRosterMetrics {
  totalComedians: number;
  activeComedians: number;
  featuredComedians: number;
  activePercentage: number;
  avgShowsPerComedian: number;
  styleDistribution: ComedyStyleDistItem[];
  topPerformers: TopPerformerItem[];
}

// Custom Tooltip for Comedy Style Chart
function StyleTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border-2 border-black p-3 text-xs font-mono shadow-[3px_3px_0px_0px_#000]">
        <p className="font-black text-black uppercase pb-1 border-b border-black mb-1.5 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-[#FFD700] border border-black inline-block" />
          {data.genre}
        </p>
        <div className="text-gray-700">
          Jumlah Komika: <span className="font-black text-black">{data.count} Talent</span>
        </div>
      </div>
    );
  }
  return null;
}

// Custom Tooltip for Top Performers Chart
function PerformerTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border-2 border-black p-3 text-xs font-mono shadow-[3px_3px_0px_0px_#000]">
        <p className="font-black text-black uppercase pb-1 border-b border-black mb-1.5 flex items-center gap-1.5">
          <Mic2 className="w-3.5 h-3.5 text-[#FF4500]" />
          {data.stageName}
        </p>
        <div className="space-y-1 text-gray-700">
          <div>
            Total Panggung: <span className="font-black text-[#FF4500]">{data.totalShows} Sets</span>
          </div>
          <div className="text-[11px] text-gray-500">
            Genre: <span className="font-bold text-black">{data.comedyStyle || "Stand-up"}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function TalentRosterAnalytics({
  metrics,
}: {
  metrics: TalentRosterMetrics;
}) {
  const isDataSufficient =
    metrics.totalComedians >= 2 &&
    metrics.styleDistribution.length > 0 &&
    metrics.topPerformers.length > 0;

  return (
    <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
      {/* 1. Header & Quick Stat Badges */}
      <div className="pb-5 border-b-2 border-black flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#FF4500] border border-black shadow-[1px_1px_0px_0px_#000]" />
            <h2 className="text-base font-black uppercase font-mono tracking-wider text-gray-900">
              Talent Roster Analytics & Jam Terbang
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#FFD700] text-black border border-black shadow-[2px_2px_0px_0px_#000]">
              NEON POSTGRES
            </span>
          </div>
          <p className="text-xs text-gray-600 font-mono mt-1">
            Metrik sebaran genre materi komedi dan akumulasi jam terbang penampilan komika StandUp INDO Timika
          </p>
        </div>

        {/* Mini Stat Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Badge 1: Total Talent */}
          <div className="px-3 py-1.5 bg-[#FFF8F6] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 text-xs font-mono">
            <Users className="w-3.5 h-3.5 text-[#FF4500]" />
            <span className="font-bold text-gray-600">Roster:</span>
            <span className="font-black text-black">{metrics.totalComedians} Komika</span>
          </div>

          {/* Badge 2: Persentase Aktif */}
          <div className="px-3 py-1.5 bg-emerald-50 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 text-xs font-mono">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold text-emerald-800">{metrics.activePercentage}% Aktif</span>
          </div>

          {/* Badge 3: Rata-rata Panggung */}
          <div className="px-3 py-1.5 bg-[#FFD700] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 text-xs font-mono">
            <Award className="w-3.5 h-3.5 text-black" />
            <span className="font-black text-black">
              Avg {metrics.avgShowsPerComedian} Sets/Talent
            </span>
          </div>
        </div>
      </div>

      {/* 2. Charts Container or Empty State Fallback */}
      {!isDataSufficient ? (
        <div className="my-8 p-8 text-center bg-[#FFF8F6] border-2 border-dashed border-gray-400">
          <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-xs font-mono font-bold text-gray-800">
            Data Style / Penampilan Belum Cukup Untuk Memproyeksikan Analitik
          </p>
          <p className="text-[11px] font-mono text-gray-500 mt-1 max-w-md mx-auto">
            Dibutuhkan minimal 2 profil komika dengan data style dan jumlah penampilan terdaftar di database untuk menampilkan grafik perbandingan genre dan jam terbang.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Distribusi Comedy Style (Horizontal Bar Chart) */}
          <div className="border-2 border-black p-4 bg-[#FFFDF9] shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-black/20">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
                  <h3 className="text-xs font-black uppercase font-mono text-black">
                    Distribusi Comedy Style (Horizontal Bar)
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-500">
                  {metrics.styleDistribution.length} Genre
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono mt-1 mb-4">
                Proporsi genre materi panggung yang dibawakan oleh komika lokal
              </p>

              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={metrics.styleDistribution}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fill: "#000000", fontSize: 10, fontFamily: "monospace", fontWeight: 700 }}
                      axisLine={{ stroke: "#000000", strokeWidth: 1.5 }}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="genre"
                      type="category"
                      width={100}
                      tick={{ fill: "#000000", fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}
                      axisLine={{ stroke: "#000000", strokeWidth: 1.5 }}
                      tickLine={false}
                    />
                    <Tooltip content={<StyleTooltip />} />
                    <Bar
                      dataKey="count"
                      fill="#FFD700"
                      stroke="#000000"
                      strokeWidth={2}
                      radius={[0, 0, 0, 0]}
                      maxBarSize={22}
                    >
                      {metrics.styleDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-style-${index}`}
                          fill={index % 2 === 0 ? "#FFD700" : "#FFA500"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-2.5 border-t border-black/10 flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span>Sumbu X: Jumlah Komika</span>
              <span>Sumbu Y: Genre Materi</span>
            </div>
          </div>

          {/* Chart 2: Top 5 Jam Terbang Komika (Vertical Bar Chart) */}
          <div className="border-2 border-black p-4 bg-[#FFFDF9] shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-black/20">
                <div className="flex items-center gap-1.5">
                  <Mic2 className="w-4 h-4 text-[#FF4500]" />
                  <h3 className="text-xs font-black uppercase font-mono text-black">
                    Top 5 Jam Terbang Komika (Total Sets)
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-black text-white px-1.5 py-0.5">
                  LEADERBOARD
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono mt-1 mb-4">
                Komika dengan frekuensi panggung open mic dan headline tertinggi
              </p>

              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.topPerformers}
                    margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="stageName"
                      tick={{ fill: "#000000", fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}
                      axisLine={{ stroke: "#000000", strokeWidth: 1.5 }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "monospace" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip content={<PerformerTooltip />} />
                    <Bar
                      dataKey="totalShows"
                      fill="#FF4500"
                      stroke="#000000"
                      strokeWidth={2}
                      radius={[0, 0, 0, 0]}
                      maxBarSize={32}
                    >
                      {metrics.topPerformers.map((entry, index) => (
                        <Cell
                          key={`cell-perf-${index}`}
                          fill={index === 0 ? "#FF4500" : index === 1 ? "#18181B" : "#FF6B35"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-2.5 border-t border-black/10 flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span>#1: {metrics.topPerformers[0]?.stageName} ({metrics.topPerformers[0]?.totalShows} Sets)</span>
              <span>Data profil comedians</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
