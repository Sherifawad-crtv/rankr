import type { IconName } from "@/components/ui";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

// TODO(spec): confirm nav structure and which items are hidden per role / plan mode.
export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/jobs", label: "Jobs", icon: "briefcase" },
  { href: "/messages", label: "Messages", icon: "message" },
  { href: "/analytics", label: "Analytics", icon: "chart" },
  { href: "/billing", label: "Billing", icon: "card" },
  { href: "/settings", label: "Settings", icon: "settings" },
];
