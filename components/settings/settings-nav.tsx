"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui";
import { cn, focusRing } from "@/components/ui/cn";
import type { MessageKey } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/locale-context";
import { useSession } from "@/lib/session";

const ITEMS: Array<{ href: string; labelKey: MessageKey; icon: IconName; enterpriseOnly?: boolean; adminOnly?: boolean }> = [
  { href: "/settings/profile", labelKey: "settings.nav.profile", icon: "user" },
  { href: "/settings/company", labelKey: "settings.nav.company", icon: "building" },
  { href: "/settings/team", labelKey: "settings.nav.team", icon: "users", enterpriseOnly: true },
  { href: "/settings/billing", labelKey: "settings.nav.billing", icon: "card", adminOnly: true },
  { href: "/settings/notifications", labelKey: "settings.nav.notifications", icon: "bell" },
];

/** Sections of Settings: a side list on large screens, a scrollable row on phones. Team is Enterprise only; Billing is for admins. */
export function SettingsNav() {
  const { t } = useLocale();
  const pathname = usePathname();
  const { user } = useSession();
  const items = ITEMS.filter(
    (item) => !(item.enterpriseOnly && user.planMode === "solo") && !(item.adminOnly && user.role === "recruiter"),
  );

  return (
    <nav aria-label={t("settings.nav.aria")} className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
      <ul className="flex gap-1 lg:flex-col">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-base font-semibold transition-colors duration-150",
                  focusRing,
                  active ? "bg-primary/10 text-primary" : "text-text-secondary hover:bg-subtle hover:text-text-primary",
                )}
              >
                <Icon name={item.icon} variant={active ? "bold" : "linear"} size={18} />
                {t(item.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
