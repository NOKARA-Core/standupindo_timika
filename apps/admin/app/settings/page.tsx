import { Settings, Database, Cloud, ShieldAlert, Key } from "lucide-react";

export default function SettingsAdminPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings & Configuration</h2>
        <p className="text-xs text-gray-500 mt-1">
          Pengaturan integrasi cloud, Supabase database client, dan kredensial Vercel
        </p>
      </div>

      <div className="space-y-5">
        {/* Supabase Integration Card */}
        <div className="bg-white border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="p-2 bg-emerald-50 text-emerald-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Supabase Connection State</h3>
              <p className="text-xs text-gray-500">PostgreSQL Database & Storage Client Integration</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">NEXT_PUBLIC_SUPABASE_URL</label>
              <input
                type="text"
                readOnly
                value="https://your-project.supabase.co (Ready for .env.local)"
                className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</label>
              <input
                type="password"
                readOnly
                value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-gray-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Community Info Card */}
        <div className="bg-white border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="p-2 bg-blue-50 text-blue-700">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Vercel & Domain Deployment</h3>
              <p className="text-xs text-gray-500">apps/admin dan apps/web multi-zone architecture</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Arsitektur monorepo Turbopack disiapkan untuk split deployment mandiri pada Vercel. Domain <code>admin.standupindotimika.com</code> atau route subpath terisolasi siap dipetakan.
          </p>
        </div>
      </div>
    </div>
  );
}
