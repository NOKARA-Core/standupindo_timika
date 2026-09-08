"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Mic2,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  initialEvents,
  initialComedians,
  initialRegistrations,
  monthlyActivityMetrics,
  OpenMicRegistration,
} from "../src/lib/mock-data";

export default function DashboardPage() {
  const [registrations, setRegistrations] =
    useState<OpenMicRegistration[]>(initialRegistrations);

  const activeEventsCount = initialEvents.filter(
    (e) => e.status !== "DRAFT"
  ).length;
  const activeComediansCount = initialComedians.filter(
    (c) => c.isActive
  ).length;
  const pendingRegistrationsCount = registrations.filter(
    (r) => r.status === "PENDING"
  ).length;

  const handleRegistrationAction = (
    id: string,
    action: "APPROVED" | "REJECTED"
  ) => {
    setRegistrations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: action } : item
      )
    );
  };

  const maxAudience = Math.max(
    ...monthlyActivityMetrics.map((m) => m.audience)
  );

  return (
    <div className="space-y-8">
      {/* 1. Polished Metric Cards with Soft Pastel Badges & Smooth Hover */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Events */}
        <div className="bg-white border border-gray-200 p-6 shadow-xs hover:shadow-sm hover:border-gray-300 transition-all duration-150 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Active Events
            </span>
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900 tracking-tight">
              {activeEventsCount}
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>2 shows coming this weekend</span>
            </div>
          </div>
        </div>

        {/* Card 2: Comedians Roster */}
        <div className="bg-white border border-gray-200 p-6 shadow-xs hover:shadow-sm hover:border-gray-300 transition-all duration-150 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Comedians
            </span>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mic2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900 tracking-tight">
              {activeComediansCount}
            </div>
            <div className="text-xs text-gray-500 mt-1.5">
              {initialComedians.length} total komika terdaftar
            </div>
          </div>
        </div>

        {/* Card 3: Pending Registrations */}
        <div className="bg-white border border-gray-200 p-6 shadow-xs hover:shadow-sm hover:border-gray-300 transition-all duration-150 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Pending Open Mic
            </span>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900 tracking-tight">
              {pendingRegistrationsCount}
            </div>
            <div className="text-xs text-amber-600 font-medium mt-1.5">
              Menunggu verifikasi kurasi
            </div>
          </div>
        </div>

        {/* Card 4: Monthly Audience */}
        <div className="bg-white border border-gray-200 p-6 shadow-xs hover:shadow-sm hover:border-gray-300 transition-all duration-150 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Estimasi Penonton
            </span>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900 tracking-tight">
              420
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+35% lonjakan penonton</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Activity Chart: Dual-Bar Performance with Y-Axis & Tooltip */}
      <div className="bg-white border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Performa Partisipasi Panggung Bulanan
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Statistik kehadiran penonton dan keaktifan pementasan komika di panggung Timika
            </p>
          </div>
          <div className="flex items-center gap-5 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-900 rounded-t-xs" />
              <span>Estimasi Penonton</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#FF4500] rounded-t-xs" />
              <span>Pementasan Selesai</span>
            </div>
          </div>
        </div>

        {/* Chart Body with Left Y-Axis and Dual-Bar Grid */}
        <div className="mt-6 pt-4">
          <div className="relative h-64 flex">
            {/* Y-Axis Reference Labels (Left) */}
            <div className="w-10 pr-2 h-[220px] flex flex-col justify-between text-right text-[11px] font-medium text-gray-400 select-none">
              <span>500</span>
              <span>250</span>
              <span>100</span>
              <span>0</span>
            </div>

            {/* Plot Area with Grid Lines & Grouped Bars */}
            <div className="flex-1 relative h-[220px]">
              {/* Horizontal Background Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="w-full border-b border-dashed border-gray-200" />
                <div className="w-full border-b border-dashed border-gray-200" />
                <div className="w-full border-b border-dashed border-gray-200" />
                <div className="w-full border-b border-gray-300" />
              </div>

              {/* Grouped Bars Container */}
              <div className="relative h-full flex items-end justify-between px-2 sm:px-6">
                {monthlyActivityMetrics.map((item) => {
                  // Scale calculations
                  // Audience max scale: 500
                  const audiencePercent = Math.min(100, Math.max(6, Math.round((item.audience / 500) * 100)));
                  // Shows max scale: 10 shows (7 shows = 70% height)
                  const showsPercent = Math.min(100, Math.max(8, Math.round((item.shows / 10) * 100)));

                  return (
                    <div
                      key={item.month}
                      className="flex flex-col items-center group relative h-full justify-end"
                    >
                      {/* Interactive Hover Tooltip Popover */}
                      <div className="absolute -top-10 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-y-1 group-hover:translate-y-0 whitespace-nowrap bg-gray-950 text-white text-[11px] py-1.5 px-3 rounded shadow-lg flex items-center gap-2 border border-gray-800">
                        <span className="font-bold text-orange-400">{item.month}</span>
                        <span className="text-gray-400">|</span>
                        <span>{item.audience} Penonton</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-orange-300 font-semibold">{item.shows} Show</span>
                      </div>

                      {/* Dual Bars Pair */}
                      <div className="flex items-end gap-1.5 sm:gap-2 px-1 h-full">
                        {/* Bar 1: Estimasi Penonton */}
                        <div
                          style={{ height: `${audiencePercent}%` }}
                          className="w-4 sm:w-6 bg-gray-900 rounded-t-xs hover:bg-black transition-all duration-200 cursor-pointer shadow-xs shrink-0"
                          title={`${item.month}: ${item.audience} Penonton`}
                        />

                        {/* Bar 2: Pementasan Selesai */}
                        <div
                          style={{ height: `${showsPercent}%` }}
                          className="w-4 sm:w-6 bg-[#FF4500] rounded-t-xs hover:bg-[#e03d00] transition-all duration-200 cursor-pointer shadow-xs shrink-0"
                          title={`${item.month}: ${item.shows} Shows`}
                        />
                      </div>

                      {/* Month Label below the baseline */}
                      <div className="absolute -bottom-6 text-xs font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                        {item.month}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Upcoming Shows & Approval List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upcoming Shows Table */}
        <div className="lg:col-span-8 bg-white border border-gray-200 shadow-xs">
          <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Upcoming Shows Schedule
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Jadwal aktif yang terdaftar di kalender acara komunitas
              </p>
            </div>
            <Link
              href="/events"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-1"
            >
              <span>Kelola Semua Acara</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75">
                  <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                    Event Title
                  </th>
                  <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                    Schedule & Venue
                  </th>
                  <th className="px-6 py-3.5 text-xs text-gray-500 uppercase font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {initialEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    className="hover:bg-gray-50/75 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-gray-900">
                        {evt.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        <span className="font-medium text-gray-700">{evt.type}</span> • Host: {evt.host}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-gray-900">
                        {evt.date} • {evt.time}
                      </div>
                      <div className="text-xs text-gray-500">{evt.venue}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded-full ${
                          evt.status === "TAPTAP LIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : evt.status === "PUBLISHED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {evt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Lineup Approvals List */}
        <div className="lg:col-span-4 bg-white border border-gray-200 shadow-xs">
          <div className="px-6 py-4.5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Pending Lineup Approvals
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Registrasi komika menunggu kurasi materi
            </p>
          </div>

          <div className="p-4 divide-y divide-gray-100">
            {registrations.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-500">
                Tidak ada pendaftaran pending.
              </div>
            ) : (
              registrations.map((reg) => (
                <div key={reg.id} className="py-4 first:pt-1 last:pb-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        {reg.comedianName}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {reg.eventTitle}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        reg.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : reg.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {reg.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2.5 border border-gray-100 leading-relaxed">
                    &quot;{reg.notes}&quot;
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-1">
                    <span className="text-[10px] text-gray-400">
                      {reg.submittedAt}
                    </span>
                    {reg.status === "PENDING" && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleRegistrationAction(reg.id, "APPROVED")
                          }
                          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRegistrationAction(reg.id, "REJECTED")
                          }
                          className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
