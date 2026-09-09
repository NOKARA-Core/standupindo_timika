"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AdminRole, canAccessPath } from "../config/nav";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

interface AuthContextType {
  user: AuthUser | null;
  role: AdminRole;
  loading: boolean;
  canAccess: (path: string) => boolean;
  switchRole: (newRole: AdminRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: "superadmin",
  loading: true,
  canAccess: () => true,
  switchRole: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AdminRole>("superadmin");
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setRole(data.user.role || "superadmin");
        }
      }
    } catch (e) {
      console.warn("Failed to fetch current user session:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const switchRole = async (newRole: AdminRole) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setRole(newRole);
        if (user) {
          setUser({ ...user, role: newRole });
        }
        // Reload page to refresh Server Components with new role cookie
        window.location.reload();
      }
    } catch (e) {
      console.error("Failed to switch role:", e);
    } finally {
      setLoading(false);
    }
  };

  const canAccess = useCallback(
    (path: string) => canAccessPath(role, path),
    [role]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        canAccess,
        switchRole,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
