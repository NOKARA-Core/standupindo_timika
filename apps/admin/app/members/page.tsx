import { Users, UserPlus, Shield, CheckCircle } from "lucide-react";

export default function MembersAdminPage() {
  const members = [
    { name: "Muhammad Amin Hidayat", role: "Ketua & Super Admin", status: "Active", joined: "2018-05-12" },
    { name: "Rian Hidayat", role: "Divisi Acara & Kurator Open Mic", status: "Active", joined: "2019-02-14" },
    { name: "Dimas Prasetyo", role: "Bendahara & Merch Coordinator", status: "Active", joined: "2020-07-20" },
    { name: "Kartika Sari", role: "Humas & Media Partner Lead", status: "Active", joined: "2021-01-10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Member & Pengurus Management</h2>
          <p className="text-xs text-gray-500 mt-1">
            Daftar pengurus inti, kurator materi, dan hak akses portal admin
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3.5 text-gray-500 uppercase font-semibold">Nama Pengurus</th>
              <th className="px-6 py-3.5 text-gray-500 uppercase font-semibold">Role / Jabatan</th>
              <th className="px-6 py-3.5 text-gray-500 uppercase font-semibold">Bergabung Sejak</th>
              <th className="px-6 py-3.5 text-gray-500 uppercase font-semibold">Status Akses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m, idx) => (
              <tr key={idx} className="hover:bg-gray-50/75 transition-colors">
                <td className="px-6 py-4 font-semibold text-gray-900">{m.name}</td>
                <td className="px-6 py-4 text-gray-600">{m.role}</td>
                <td className="px-6 py-4 text-gray-500">{m.joined}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    <CheckCircle className="w-3 h-3" />
                    <span>{m.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
