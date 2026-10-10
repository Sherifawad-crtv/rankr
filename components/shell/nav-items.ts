import type { IconName } from "@/components/ui";
import type { MessageKey } from "@/lib/i18n";

export interface NavItem {
  href: string;
  labelKey: MessageKey;
  icon: IconName;
}

// TODO(spec): confirm nav structure and which items are hidden per role / plan mode.
export const navItems: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: "home" },
  { href: "/jobs", labelKey: "nav.jobs", icon: "briefcase" },
  { href: "/applicants", labelKey: "nav.applicants", icon: "users" },
  { href: "/settings", labelKey: "nav.settings", icon: "settings" },
];
