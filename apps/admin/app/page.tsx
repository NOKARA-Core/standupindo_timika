import Link from "next/link";
import { cookies } from "next/headers";
import {
  Calendar,
  Users,
  Mic2,
  TrendingUp,
  Clock,
  ArrowRight,
  ShoppingBag,
  DollarSign,
  Package,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Palette,
  ExternalLink,
} from "lucide-react";
import { getSql } from "../src/lib/db";
import { FinanceTrendChart, MonthlyFinanceItem } from "../src/components/analytics/FinanceTrendChart";
import { EventActivityChart, MonthlyEventItem } from "../src/components/analytics/EventActivityChart";
import { ContentMerchDistChart, MerchCategoryItem } from "../src/components/analytics/ContentMerchDistChart";
import { RegistrationsList } from "../src/components/RegistrationsList";
import { AdminRole } from "../src/config/nav";

export const dynamic = "force-dynamic";

interface UpcomingEventRow {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  venue: string;
  host: string;
  price: string;
  status: string;
}

interface RecentTransactionRow {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  transactionDate: string;
  description: string;
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

async function getCurrentRole(): Promise<AdminRole> {
  try {
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get("stup_admin_role")?.value;
    if (roleCookie === "curator") return "curator";
    if (roleCookie === "superadmin") return "superadmin";

    const sessionCookie = cookieStore.get("stup_admin_session")?.value;
    if (sessionCookie) {
      const sql = getSql();
      const rows = await sql`SELECT role FROM admin_users WHERE id = ${sessionCookie} LIMIT 1`;
      if (rows[0]?.role === "curator") return "curator";
    }
  } catch (e) {
    console.warn("Could not read current role:", e);
  }
  return "superadmin";
}

async function getDashboardData(role: AdminRole) {
  try {
    const sql = getSql();

    // Parallel fetch core metrics
    const [
      activeEventsRes,
      activeComediansRes,
      netCashRes,
      merchStatsRes,
      pendingRegRes,
      upcomingEventsRes,
      merchDistRes,
    ] = await Promise.all([
      // 1. Total Active Shows (Count dari events WHERE status != 'DRAFT' and != 'CLOSED')
      sql`
        SELECT count(*)::int as count 
        FROM events 
        WHERE LOWER(status) != 'draft' AND LOWER(status) != 'closed'
      `,
      // 2. Active Comedians
      sql`SELECT count(*)::int as count FROM comedians WHERE is_active = true`,
      // 3. Kas Bersih Komunitas (SUM masuk - SUM keluar dari finances)
      sql`
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE -amount END), 0)::numeric as net_balance,
          COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0)::numeric as total_income,
          COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0)::numeric as total_expense
        FROM finances
      `,
      // 4. Katalog Merch (Count produk & total fisik stok)
      sql`
        SELECT 
          count(*)::int as total_items, 
          COALESCE(SUM(stock), 0)::int as total_stock 
        FROM merchandise 
        WHERE is_active = true
      `,
      // 5. Pending Open Mic Registrations
      sql`SELECT count(*)::int as count FROM open_mic_registrations WHERE status = 'PENDING'`,
      // 6. Upcoming 3 Events (3 terdekat)
      sql`
        SELECT id, title, type, date, time, venue, host, price, status 
        FROM events 
        WHERE date IS NOT NULL 
        ORDER BY CASE WHEN date >= CURRENT_DATE::varchar THEN 0 ELSE 1 END, date ASC, time ASC 
        LIMIT 3
      `,
      // 7. Distribusi Kategori Merchandise (Pie Chart)
      sql`
        SELECT 
          category as name,
          COALESCE(SUM(stock), 0)::int as value,
          count(*)::int as "itemCount"
        FROM merchandise
        WHERE is_active = true
        GROUP BY category
        ORDER BY value DESC
      `,
    ]);

    // Role-specific queries
    let financeTrend: MonthlyFinanceItem[] = [];
    let recentTransactions: RecentTransactionRow[] = [];
    let eventActivityTrend: MonthlyEventItem[] = [];
    let registrations: RegistrationRow[] = [];

    if (role === "superadmin") {
      const [trendRes, transactionsRes] = await Promise.all([
        sql`
          SELECT 
            TO_CHAR(transaction_date::date, 'Mon YYYY') as "monthLabel",
            DATE_TRUNC('month', transaction_date::date) as "monthDate",
            COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0)::numeric as income,
            COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0)::numeric as expense
          FROM finances
          WHERE transaction_date IS NOT NULL
          GROUP BY "monthLabel", "monthDate"
          ORDER BY "monthDate" ASC
          LIMIT 6
        `,
        sql`
          SELECT 
            id, 
            type, 
            category, 
            amount, 
            transaction_date as "transactionDate", 
            description 
          FROM finances 
          ORDER BY transaction_date DESC, created_at DESC 
          LIMIT 5
        `,
      ]);

      financeTrend = trendRes.map((r) => ({
        monthLabel: r.monthLabel,
        income: Number(r.income) || 0,
        expense: Number(r.expense) || 0,
      }));
      recentTransactions = transactionsRes as unknown as RecentTransactionRow[];
    } else {
      // Curator role gets event activity trends & pending submissions
      const [eventTrendRes, regListRes] = await Promise.all([
        sql`
          SELECT 
            TO_CHAR(date::date, 'Mon YYYY') as "monthLabel",
            DATE_TRUNC('month', date::date) as "monthDate",
            count(*)::int as "totalShows",
            count(CASE WHEN UPPER(type) LIKE '%OPEN MIC%' THEN 1 END)::int as "openMicShows",
            count(CASE WHEN UPPER(type) LIKE '%SPECIAL%' OR UPPER(type) LIKE '%SHOWCASE%' THEN 1 END)::int as "specialShows"
          FROM events
          WHERE date IS NOT NULL AND date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
          GROUP BY "monthLabel", "monthDate"
          ORDER BY "monthDate" ASC
          LIMIT 6
        `,
        sql`
          SELECT 
            id, 
            event_id, 
            event_title, 
            comedian_name, 
            phone, 
            notes, 
            status, 
            submitted_at 
          FROM open_mic_registrations 
          ORDER BY created_at DESC 
          LIMIT 6
        `,
      ]);

      eventActivityTrend = eventTrendRes.map((r) => ({
        monthLabel: r.monthLabel,
        totalShows: Number(r.totalShows) || 0,
        openMicShows: Number(r.openMicShows) || 0,
        specialShows: Number(r.specialShows) || 0,
      }));
      registrations = regListRes as unknown as RegistrationRow[];
    }

    return {
      activeEventsCount: activeEventsRes[0]?.count || 0,
      activeComediansCount: activeComediansRes[0]?.count || 0,
      netCashBalance: Number(netCashRes[0]?.net_balance) || 0,
      totalIncome: Number(netCashRes[0]?.total_income) || 0,
      totalExpense: Number(netCashRes[0]?.total_expense) || 0,
      totalMerchItems: merchStatsRes[0]?.total_items || 0,
      totalMerchStock: merchStatsRes[0]?.total_stock || 0,
      pendingRegistrationsCount: pendingRegRes[0]?.count || 0,
      upcomingEvents: upcomingEventsRes as unknown as UpcomingEventRow[],
      merchDistribution: merchDistRes as unknown as MerchCategoryItem[],
      financeTrend,
      recentTransactions,
      eventActivityTrend,
      registrations,
    };
  } catch (error) {
    console.error("Dashboard DB query error:", error);
    return {
      activeEventsCount: 0,
      activeComediansCount: 0,
      netCashBalance: 0,
      totalIncome: 0,
      totalExpense: 0,
      totalMerchItems: 0,
      totalMerchStock: 0,
      pendingRegistrationsCount: 0,
      upcomingEvents: [],
      merchDistribution: [],
      financeTrend: [],
      recentTransactions: [],
      eventActivityTrend: [],
      registrations: [],
    };
  }
}

export default async function DashboardPage() {
  const currentRole = await getCurrentRole();
  const data = await getDashboardData(currentRole);

  const isSuperadmin = currentRole === "superadmin";

  return (
    <div className="space-y-8">
      {/* 0. Role Mode Welcome Banner */}
      <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 flex items-center justify-center font-black text-xs font-mono border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
              isSuperadmin
                ? "bg-emerald-400 text-black"
                : "bg-purple-400 text-black"
            }`}
          >
            {isSuperadmin ? "SA" : "CR"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase font-mono tracking-wider text-black">
                {isSuperadmin
                  ? "SUPERADMINISTRATOR DASHBOARD"
                  : "CURATOR KONTEN KREATIF DASHBOARD"}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 border uppercase ${
                  isSuperadmin
                    ? "bg-emerald-100 text-emerald-800 border-emerald-400"
                    : "bg-purple-100 text-purple-800 border-purple-400"
                }`}
              >
                Akses {isSuperadmin ? "Penuh (Finansial + Ops)" : "Konten Kreatif"}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {isSuperadmin
                ? "Memantau arus kas komunitas, inventaris merchandise, jadwal event, dan tim admin secara terpadu."
                : "Memantau kurasi panggung, pendaftaran open mic, profil komika, dan aset media kreatif."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-gray-600">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>PostgreSQL Neon Live Connection</span>
        </div>
      </div>

      {/* 1. Stat Cards Atas (Role-based metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Active Shows */}
        <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 uppercase font-mono tracking-wider">
              Total Active Shows
            </span>
            <div className="w-9 h-9 bg-[#FFF8F6] text-[#FF4500] border border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-gray-900 font-mono tracking-tight">
              {data.activeEventsCount}
            </div>
            <div className="text-xs text-emerald-700 font-mono font-bold mt-1.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Jadwal Aktif Publik</span>
            </div>
          </div>
        </div>

        {/* Card 2: Roster Comedians */}
        <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 uppercase font-mono tracking-wider">
              Roster Comedians
            </span>
            <div className="w-9 h-9 bg-blue-50 text-blue-700 border border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <Mic2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-gray-900 font-mono tracking-tight">
              {data.activeComediansCount}
            </div>
            <div className="text-xs text-gray-500 font-mono mt-1.5">
              Komika status aktif di web
            </div>
          </div>
        </div>

        {/* Card 3: Total Kas Bersih Komunitas (*HANYA SUPERADMIN*) OR Pending Kurasi (*CURATOR*) */}
        {isSuperadmin ? (
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600 uppercase font-mono tracking-wider">
                Total Kas Bersih
              </span>
              <div className="w-9 h-9 bg-emerald-50 text-emerald-700 border border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-gray-900 font-mono tracking-tight truncate">
                Rp {data.netCashBalance.toLocaleString("id-ID")}
              </div>
              <div className="text-xs text-emerald-700 font-mono font-bold mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Saldo Kas Komunitas</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600 uppercase font-mono tracking-wider">
                Pending Open Mic
              </span>
              <div className="w-9 h-9 bg-amber-50 text-amber-700 border border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-gray-900 font-mono tracking-tight">
                {data.pendingRegistrationsCount}
              </div>
              <div className="text-xs text-amber-700 font-mono font-bold mt-1.5">
                Menunggu verifikasi kurasi
              </div>
            </div>
          </div>
        )}

        {/* Card 4: Total Katalog Merch */}
        <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 uppercase font-mono tracking-wider">
              Katalog Merchandise
            </span>
            <div className="w-9 h-9 bg-purple-50 text-purple-700 border border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-gray-900 font-mono tracking-tight">
              {data.totalMerchItems} Item
            </div>
            <div className="text-xs text-gray-600 font-mono mt-1.5 font-bold">
              {data.totalMerchStock} pcs total stok fisik
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Analytics Section (Recharts Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Finance Trend (Superadmin) OR Event Activity (Curator) */}
        <div className="lg:col-span-8">
          {isSuperadmin ? (
            <FinanceTrendChart data={data.financeTrend} />
          ) : (
            <EventActivityChart data={data.eventActivityTrend} />
          )}
        </div>

        {/* Chart 2: Merchandise Category Distribution (Donut Chart) */}
        <div className="lg:col-span-4">
          <ContentMerchDistChart
            data={data.merchDistribution}
            totalStock={data.totalMerchStock}
          />
        </div>
      </div>

      {/* 3. Quick Widget Tables at Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Widget 1: Upcoming 3 Events (Left Column) */}
        <div className="lg:col-span-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF4500]" />
                <h2 className="text-sm font-black uppercase font-mono tracking-wider text-gray-900">
                  Upcoming 3 Events
                </h2>
              </div>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                3 agenda pementasan terdekat dari tabel <code>events</code>
              </p>
            </div>
            <Link
              href="/events"
              className="text-xs font-mono font-bold text-black hover:text-[#FF4500] hover:underline inline-flex items-center gap-1"
            >
              <span>Semua Acara</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y-2 divide-black">
            {data.upcomingEvents.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-gray-500">
                Belum ada jadwal acara mendatang di database.
              </div>
            ) : (
              data.upcomingEvents.map((evt, idx) => (
                <div
                  key={evt.id}
                  className="p-4 hover:bg-[#FFF8F6] transition-colors flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-black font-mono bg-black text-white px-2 py-0.5 shrink-0">
                      0{idx + 1}
                    </span>
                    <div>
                      <div className="font-black text-sm text-gray-900 font-mono">
                        {evt.title}
                      </div>
                      <div className="text-xs text-gray-600 font-mono mt-0.5">
                        <span className="font-bold text-[#FF4500]">{evt.type}</span> • {evt.venue}
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono mt-1">
                        📅 {evt.date} • {evt.time}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 border uppercase shrink-0 ${
                      evt.status === "TAPTAP LIVE"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-400"
                        : evt.status === "PUBLISHED"
                        ? "bg-blue-100 text-blue-800 border-blue-400"
                        : "bg-gray-100 text-gray-700 border-gray-400"
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 2: Recent Transactions (Superadmin) OR Pending Registrations (Curator) */}
        <div className="lg:col-span-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          {isSuperadmin ? (
            <div>
              <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h2 className="text-sm font-black uppercase font-mono tracking-wider text-gray-900">
                      Recent 5 Transactions (Finances)
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    Catatan arus kas terakhir dari tabel <code>finances</code>
                  </p>
                </div>
                <Link
                  href="/finances"
                  className="text-xs font-mono font-bold text-black hover:text-emerald-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>Buku Kas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y-2 divide-black">
                {data.recentTransactions.length === 0 ? (
                  <div className="p-8 text-center text-xs font-mono text-gray-500">
                    Belum ada riwayat transaksi kas di database.
                  </div>
                ) : (
                  data.recentTransactions.map((tx) => {
                    const isIncome = tx.type === "INCOME";
                    return (
                      <div
                        key={tx.id}
                        className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-none border border-black flex items-center justify-center shrink-0 ${
                              isIncome
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold font-mono text-gray-900 truncate">
                              {tx.description}
                            </div>
                            <div className="text-[11px] text-gray-500 font-mono">
                              {tx.category} • {tx.transactionDate}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-mono font-black shrink-0 ${
                            isIncome ? "text-emerald-700" : "text-red-600"
                          }`}
                        >
                          {isIncome ? "+" : "-"} Rp {Number(tx.amount).toLocaleString("id-ID")}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <h2 className="text-sm font-black uppercase font-mono tracking-wider text-gray-900">
                      Pending Open Mic Approvals
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    Antrean kurasi komika baru dari registrasi online
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5">
                  {data.pendingRegistrationsCount} Pending
                </span>
              </div>
              <RegistrationsList initialRegistrations={data.registrations} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
