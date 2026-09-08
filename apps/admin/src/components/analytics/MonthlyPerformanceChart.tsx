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
import { monthlyActivityMetrics } from "../../lib/mock-data";

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  name?: string;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const audience = payload.find((p) => p.dataKey === "audience")?.value ?? 0;
    const shows = payload.find((p) => p.dataKey === "shows")?.value ?? 0;

    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-xl rounded-lg p-3 text-xs min-w-[170px]">
        <p className="font-bold text-gray-900 border-b border-gray-100 pb-1.5 mb-2">
          Bulan {label}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-900 shrink-0" />
              <span>Estimasi Penonton:</span>
            </span>
            <span className="font-bold text-gray-900">{audience}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF4500] shrink-0" />
              <span>Pementasan Selesai:</span>
            </span>
            <span className="font-bold text-[#FF4500]">{shows} show</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function MonthlyPerformanceChart() {
  return (
    <div className="bg-white border border-gray-200 p-6 shadow-xs">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Performa Partisipasi Panggung Bulanan
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Tren estimasi penonton dan kuantitas pementasan panggung Timika
          </p>
        </div>
        <div className="flex items-center gap-5 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-gray-900 rounded-xs" />
            <span>Estimasi Penonton (Area)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#FF4500] rounded-xs" />
            <span>Pementasan (Bar)</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-6 w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={monthlyActivityMetrics}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="audienceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#18181B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#18181B" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              dy={6}
            />

            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              domain={[0, 500]}
              ticks={[0, 100, 250, 500]}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              hide
              domain={[0, 10]}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Area Curve for Audience */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="audience"
              stroke="#18181B"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#audienceGradient)"
              name="Estimasi Penonton"
            />

            {/* Bar for Shows Finished */}
            <Bar
              yAxisId="right"
              dataKey="shows"
              fill="#FF4500"
              barSize={18}
              radius={[4, 4, 0, 0]}
              name="Pementasan Selesai"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
