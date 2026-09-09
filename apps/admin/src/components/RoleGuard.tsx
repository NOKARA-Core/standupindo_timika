"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { canAccessPath } from "../config/nav";
import { Loader2 } from "lucide-react";

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!canAccessPath(role, pathname)) {
        router.replace(`/?access_denied=true&from=${encodeURIComponent(pathname)}`);
      }
    }
  }, [role, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF4500]" />
      </div>
    );
  }

  if (!canAccessPath(role, pathname)) {
    return (
      <div className="p-8 bg-red-100 border-2 border-red-600 text-red-900 font-mono text-xs shadow-[4px_4px_0px_0px_#991B1B]">
        <p className="font-bold text-sm mb-2 uppercase">⚠️ Akses Terbatas</p>
        <p>
          Akun Anda dengan role <strong>CURATOR</strong> tidak memiliki izin mengakses modul ini. Mengalihkan ke Dashboard...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
