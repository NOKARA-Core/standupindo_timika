import {
  LayoutDashboard,
  Calendar,
  Mic2,
  ShoppingBag,
  WalletCards,
  UserCheck,
  Image as ImageIcon,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type AdminRole = "superadmin" | "curator";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  roles?: AdminRole[];
}

// Routes strictly prohibited for Curator role
export const CURATOR_FORBIDDEN_PATHS = [
  "/finances",
  "/store",
  "/members",
  "/settings",
];

// Helper to check if a specific path can be accessed by the given role
export function canAccessPath(role: AdminRole, path: string): boolean {
  if (role === "superadmin") return true;
  return !CURATOR_FORBIDDEN_PATHS.some(
    (forbidden) => path === forbidden || path.startsWith(`${forbidden}/`)
  );
}

// Filter navigation items strictly based on role
export function filterNavByRole(items: NavItem[], role: AdminRole): NavItem[] {
  if (role === "superadmin") return items;
  return items.filter((item) => canAccessPath(role, item.href));
}

// Strictly ordered according to DESIGN-SYSTEM.md & spec
export const adminNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["superadmin", "curator"],
  },
  {
    label: "Events",
    href: "/events",
    icon: Calendar,
    roles: ["superadmin", "curator"],
  },
  {
    label: "Comedians",
    href: "/comedians",
    icon: Mic2,
    roles: ["superadmin", "curator"],
  },
  {
    label: "Merchandise",
    href: "/store",
    icon: ShoppingBag,
    roles: ["superadmin"],
  },
  {
    label: "Finances",
    href: "/finances",
    icon: WalletCards,
    roles: ["superadmin"],
  },
  {
    label: "Members",
    href: "/members",
    icon: UserCheck,
    roles: ["superadmin"],
  },
  {
    label: "Media",
    href: "/media",
    icon: ImageIcon,
    roles: ["superadmin", "curator"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["superadmin"],
  },
];
