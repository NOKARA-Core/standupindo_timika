import {
  LayoutDashboard,
  Calendar,
  Mic2,
  ShoppingBag,
  DollarSign,
  Users,
  Image as ImageIcon,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

// Strictly ordered according to DESIGN-SYSTEM.md & spec
export const adminNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Events",
    href: "/events",
    icon: Calendar,
  },
  {
    label: "Comedians",
    href: "/comedians",
    icon: Mic2,
  },
  {
    label: "Merchandise",
    href: "/store",
    icon: ShoppingBag,
  },
  {
    label: "Finances",
    href: "/finances",
    icon: DollarSign,
  },
  {
    label: "Members",
    href: "/members",
    icon: Users,
  },
  {
    label: "Media",
    href: "/media",
    icon: ImageIcon,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
