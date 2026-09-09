import Link from "next/link";
import {
  Calendar,
  Users,
  Mic2,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getSql } from "../src/lib/db";
import { MonthlyPerformanceChart } from "../src/components/analytics/MonthlyPerformanceChart";
import { ComedyStyleChart } from "../src/components/analytics/ComedyStyleChart";
import { ShowCapacityMetric } from "../src/components/analytics/ShowCapacityMetric";
import { RegistrationsList } from "../src/components/RegistrationsList";

export const dynamic = "force-dynamic";

interface EventRow {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  venue: string;
  host: string;
  status: string;
}

interface RegistrationRow {
  id: string;
  event_id: string;
  event_title: string;
  comedian_name: string;
  phone: string;
  notes: string;
  status: string;
  submitted_at: string;
}

async function getDashboardData() {
  try {
    const sql = getSql();
    const [
      activeEventsCountRes,
      activeComediansCountRes,
      totalComediansRes,
      pendingRegCountRes,
      recentEvents,
      registrations,
    ] = await Promise.all([
      sql`SELECT count(*)::int as count FROM events WHERE status != 'DRAFT'`,
      sql`SELECT count(*)::int as count FROM comedians WHERE is_active = true`,
      sql`SELECT count(*)::int as count FROM comedians`,
      sql`SELECT count(*)::int as count FROM open_mic_registrations WHERE status = 'PENDING'`,
      sql`SELECT id, title, type, date, time, venue, host, status FROM events ORDER BY date ASC, time ASC LIMIT 5`,
      sql`SELECT id, event_id, event_title, comedian_name, phone, notes, status, submitted_at FROM open_mic_registrations ORDER BY created_at DESC LIMIT 6`,
    ]);

    return {
      activeEventsCount: activeEventsCountRes[0]?.count || 0,
      activeComediansCount: activeComediansCountRes[0]?.count || 0,
      totalComediansCount: totalComediansRes[0]?.count || 0,
      pendingRegistrationsCount: pendingRegCountRes[0]?.count || 0,
      events: recentEvents as unknown as EventRow[],
      registrations: registrations as unknown as RegistrationRow[],
    };
  } catch (error) {
    console.error("Dashboard DB query error:", error);
    return {
      activeEventsCount: 0,
      activeComediansCount: 0,
      totalComediansCount: 0,
      pendingRegistrationsCount: 0,
      events: [],
      registrations: [],
    };
  }
}

export default async function DashboardPage() {
  const {
    activeEventsCount,
    activeComediansCount,
    totalComediansCount,
    pendingRegistrationsCount,
    events,
    registrations,
  } = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* 1. Polished Metric Cards */}
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
              <span>Real-time dari Neon DB</span>
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
              {totalComediansCount} total komika terdaftar
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
              <span>Kapasitas venue Timika</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyPerformanceChart />
        </div>
        <div className="lg:col-span-1">
          <ComedyStyleChart />
        </div>
      </div>

      {/* Show Capacity Metric Card */}
      <div>
        <ShowCapacityMetric />
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
                Data jadwal aktif langsung dari database Neon
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
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-xs text-gray-500">
                      Belum ada jadwal acara.
                    </td>
                  </tr>
                ) : (
                  events.map((evt) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Pending Lineup Approvals Component */}
        <div className="lg:col-span-4 bg-white border border-gray-200 shadow-xs">
          <RegistrationsList initialRegistrations={registrations} />
        </div>
      </div>
    </div>
  );
}
