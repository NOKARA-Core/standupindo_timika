import { Settings, Shield, Bell, MapPin, Building, Globe } from "lucide-react";

export default function SettingsAdminPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Settings & Community Configuration
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Pusat kendali operasional komunitas StandUp INDO Timika dan kontak resmi
        </p>
      </div>

      <div className="space-y-5">
        {/* Operations Center Card */}
        <div className="bg-white border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-full">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                StandUp INDO Timika Operations Center
              </h3>
              <p className="text-xs text-gray-500">
                Informasi identitas resmi sekretariat dan basecamp komunitas
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Nama Komunitas
              </label>
              <input
                type="text"
                readOnly
                value="StandUp INDO Timika"
                className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Wilayah Chapter
              </label>
              <input
                type="text"
                readOnly
                value="Kabupaten Mimika, Papua Tengah"
                className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 font-medium"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-gray-700 mb-1">
              Basecamp Resmi (HQ)
            </label>
            <input
              type="text"
              readOnly
              value="SKY COFFEE25, Jl. Bhayangkara, Koperapoka, Timika"
              className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 font-medium"
            />
          </div>
        </div>

        {/* Operational Guidelines & Contact */}
        <div className="bg-white border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-full">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Persetujuan & Kurasi Panggung
              </h3>
              <p className="text-xs text-gray-500">
                Standar operasional kurasi panggung open mic mingguan
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Setiap pendaftar Open Mic baru wajib melalui tahap verifikasi line-up di menu <strong>Dashboard</strong> atau <strong>Events</strong> sebelum nama komika dipublikasikan ke jadwal penonton.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Email Kontak Pengurus
              </label>
              <input
                type="text"
                readOnly
                value="standupindotimika@gmail.com"
                className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                WhatsApp Admin
              </label>
              <input
                type="text"
                readOnly
                value="+62 812-3456-7890"
                className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-900 font-medium"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
