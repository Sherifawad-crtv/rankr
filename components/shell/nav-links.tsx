"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn, focusRing } from "@/components/ui/cn";
import { navItems } from "./nav-items";

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useLocale();
  return (
    <nav aria-label={t("nav.main")} className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-semibold transition-colors duration-100",
              focusRing,
              active
                ? "bg-primary/10 text-primary"
                : "text-text-secondary hover:bg-subtle hover:text-text-primary",
            )}
          >
            <Icon name={item.icon} variant={active ? "bold" : "linear"} />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
