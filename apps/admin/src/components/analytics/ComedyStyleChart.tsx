"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const comedyStyleData = [
  { name: "Observational", value: 40, count: 10, color: "#FF4500" },
  { name: "Storytelling", value: 25, count: 6, color: "#18181B" },
  { name: "Dark Comedy", value: 20, count: 5, color: "#F59E0B" },
  { name: "Absurd / Lainnya", value: 15, count: 3, color: "#71717A" },
];

const TOTAL_COMEDIANS = 24;

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: {
    name: string;
    value: number;
    count: number;
    color: string;
  };
}

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomPieTooltip({ active, payload }: CustomPieTooltipProps) {
  if (active && payload && payload.length > 0 && payload[0]?.payload) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-xl rounded-lg p-2.5 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-bold text-gray-900">{data.name}</span>
        </div>
        <div className="text-gray-500 text-[11px] pl-4">
          <span className="font-semibold text-gray-900">{data.count} Komika</span> ({data.value}%)
        </div>
      </div>
    );
  }
  return null;
}

export function ComedyStyleChart() {
  return (
    <div className="bg-white border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Gaya Komedi Komika
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Distribusi genre materi panggung komunitas
            </p>
          </div>
          <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-xs">
            24 Terdaftar
          </span>
        </div>

        {/* Donut Chart with Center Text */}
        <div className="relative h-48 w-full mt-2 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Pie
                data={comedyStyleData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {comedyStyleData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Overlay Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-2xl font-black text-gray-900 tracking-tight leading-none">
              {TOTAL_COMEDIANS}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-1">
              Komika
            </span>
          </div>
        </div>
      </div>

      {/* Legend List with Badges */}
      <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
        {comedyStyleData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700 font-medium">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-[11px]">{item.count} orang</span>
              <span className="font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                {item.value}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
