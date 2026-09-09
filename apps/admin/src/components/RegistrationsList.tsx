"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface RegistrationItem {
  id: string;
  event_id: string;
  event_title: string;
  comedian_name: string;
  phone: string;
  notes: string;
  status: string;
  submitted_at: string;
}

export function RegistrationsList({
  initialRegistrations,
}: {
  initialRegistrations: RegistrationItem[];
}) {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>(
    initialRegistrations
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: action }),
      });

      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: action } : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <div className="px-6 py-4.5 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Pending Lineup Approvals
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Registrasi komika dari database Neon
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
                    {reg.comedian_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {reg.event_title}
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
                  {reg.submitted_at}
                </span>
                {reg.status === "PENDING" && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={loadingId === reg.id}
                      onClick={() => handleAction(reg.id, "APPROVED")}
                      className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{loadingId === reg.id ? "Saving..." : "Approve"}</span>
                    </button>
                    <button
                      type="button"
                      disabled={loadingId === reg.id}
                      onClick={() => handleAction(reg.id, "REJECTED")}
                      className="px-3 py-1.5 bg-white hover:bg-red-50 disabled:opacity-50 text-red-600 border border-red-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
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
    </>
  );
}
