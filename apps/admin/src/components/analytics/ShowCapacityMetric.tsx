"use client";

import { Users, Ticket, CheckCircle2, TrendingUp } from "lucide-react";

export function ShowCapacityMetric() {
  const totalCapacity = 120; // Kapasitas venue Sky Coffee25 Timika
  const ticketsSold = 106; // Terjual via TapTap
  const rsvpOpenMic = 14; // Komika & Crew RSVP
  const totalOccupied = ticketsSold + rsvpOpenMic;
  const occupancyRate = Math.min(100, Math.round((totalOccupied / totalCapacity) * 100));

  return (
    <div className="bg-white border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Keterisian Kursi Show
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Okupansi tiket TapTap vs Venue Sky Coffee25
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
            <Ticket className="w-4 h-4" />
          </div>
        </div>

        {/* Big Percentage Display */}
        <div className="mt-5 flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              {occupancyRate}%
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Hampir Sold Out (120 Kursi)</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400">Total Hadir</span>
            <div className="text-sm font-bold text-gray-900">
              {totalOccupied} / {totalCapacity} Pax
            </div>
          </div>
        </div>

        {/* Multi-Segment Stacked Progress Bar */}
        <div className="mt-5">
          <div className="h-3.5 w-full bg-gray-100 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-gray-200">
            {/* Sold tickets */}
            <div
              style={{ width: `${(ticketsSold / totalCapacity) * 100}%` }}
              className="bg-gray-900 rounded-l-full h-full transition-all duration-500"
              title={`Tiket Berbayar: ${ticketsSold}`}
            />
            {/* RSVP / Comedians */}
            <div
              style={{ width: `${(rsvpOpenMic / totalCapacity) * 100}%` }}
              className="bg-[#FF4500] h-full transition-all duration-500"
              title={`RSVP Komika/Crew: ${rsvpOpenMic}`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1.5 px-0.5 font-medium">
            <span>0 Kursi</span>
            <span>Target: 120 Kursi (Full House)</span>
          </div>
        </div>
      </div>

      {/* Breakdown Details List */}
      <div className="mt-6 pt-4 border-t border-gray-100 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-900 shrink-0" />
            <span className="text-gray-700 font-medium">Tiket TapTap Terjual</span>
          </div>
          <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
            {ticketsSold} Tiket
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4500] shrink-0" />
            <span className="text-gray-700 font-medium">RSVP Komika & Tim</span>
          </div>
          <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-[11px]">
            {rsvpOpenMic} Slot
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300 shrink-0" />
            <span className="text-gray-500 font-medium">Sisa Kursi Terbuka</span>
          </div>
          <span className="font-semibold text-gray-500">
            {totalCapacity - totalOccupied} Kursi
          </span>
        </div>
      </div>
    </div>
  );
}
