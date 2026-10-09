"use client";

import { Icon, MatchScore, type IconName } from "@/components/ui";
import { useLocale } from "@/lib/i18n/locale-context";

const POINTS: Array<{ icon: IconName; key: "auth.panel.point1" | "auth.panel.point2" | "auth.panel.point3" }> = [
  { icon: "shield", key: "auth.panel.point1" },
  { icon: "sparkles", key: "auth.panel.point2" },
  { icon: "global", key: "auth.panel.point3" },
];

/** The brand side of the sign-in screens (large screens only). Decorative sample, no real data. */
export function AuthPanel() {
  const { t } = useLocale();
  return (
    <aside className="relative hidden flex-col justify-center gap-10 overflow-hidden bg-inverse p-12 text-text-inverse lg:flex">
      <div
        aria-hidden
        className="absolute -end-24 -top-24 size-96 rounded-full bg-primary/30 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -start-16 bottom-0 size-72 rounded-full bg-primary/20 blur-3xl"
      />

      <div className="relative flex flex-col gap-6">
        <h2 className="max-w-md font-display text-3xl font-bold leading-tight">{t("auth.panel.title")}</h2>
        <ul className="flex max-w-md flex-col gap-4">
          {POINTS.map((point) => (
            <li key={point.key} className="flex items-center gap-3 text-base text-text-inverse/80">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-text-inverse/10">
                <Icon name={point.icon} variant="bold" size={18} />
              </span>
              {t(point.key)}
            </li>
          ))}
        </ul>
      </div>

      <div
        aria-hidden
        className="relative flex w-72 animate-float items-center gap-4 rounded-xl bg-surface p-4 text-text-primary shadow-lg"
      >
        <MatchScore value={87} />
        <div>
          <p className="text-base font-semibold">Ahmed Hassan</p>
          <p className="text-sm text-text-secondary">{t("auth.panel.sampleJob")}</p>
        </div>
      </div>
    </aside>
  );
}
