import { DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

export default function FinancesAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Financial Reports</h2>
        <p className="text-xs text-gray-500 mt-1">
          Laporan kas masuk & keluar open mic, penjualan merchandise, dan bagi hasil acara
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Kas Komunitas Saat Ini</span>
          <div className="text-2xl font-bold text-gray-900 mt-2">Rp 14.850.000</div>
          <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+Rp 2.400.000 bulan ini</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Total Tiket Terjual (TapTap)</span>
          <div className="text-2xl font-bold text-gray-900 mt-2">Rp 8.250.000</div>
          <div className="text-xs text-gray-500 mt-1">110 Tiket Special Show</div>
        </div>

        <div className="bg-white border border-gray-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Merchandise Store Revenue</span>
          <div className="text-2xl font-bold text-gray-900 mt-2">Rp 3.120.000</div>
          <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Kaos 'Live Raw' terlaris</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-xs p-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
          Transaksi Terakhir (Arus Kas)
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-gray-500 uppercase font-semibold">Deskripsi</th>
              <th className="px-6 py-3 text-gray-500 uppercase font-semibold">Kategori</th>
              <th className="px-6 py-3 text-gray-500 uppercase font-semibold">Tanggal</th>
              <th className="px-6 py-3 text-gray-500 uppercase font-semibold text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-6 py-3 font-medium text-gray-900">Penjualan 12 Kaos 'Live Raw' Pre-Order</td>
              <td className="px-6 py-3 text-gray-600">Merchandise</td>
              <td className="px-6 py-3 text-gray-500">2026-10-08</td>
              <td className="px-6 py-3 text-right font-bold text-emerald-600">+Rp 1.800.000</td>
            </tr>
            <tr>
              <td className="px-6 py-3 font-medium text-gray-900">Sewa Sound System & Mic Wireless The Bunker</td>
              <td className="px-6 py-3 text-gray-600">Operasional Show</td>
              <td className="px-6 py-3 text-gray-500">2026-10-05</td>
              <td className="px-6 py-3 text-right font-bold text-red-600">-Rp 450.000</td>
            </tr>
            <tr>
              <td className="px-6 py-3 font-medium text-gray-900">Bagi Hasil Tiket Presale Roasting Timika (TapTap)</td>
              <td className="px-6 py-3 text-gray-600">Tiket Acara</td>
              <td className="px-6 py-3 text-gray-500">2026-10-02</td>
              <td className="px-6 py-3 text-right font-bold text-emerald-600">+Rp 3.750.000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
