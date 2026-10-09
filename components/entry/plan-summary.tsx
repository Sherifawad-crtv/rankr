"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/locale-context";
import type { PlanSelection } from "@/types";

export function PlanSummary({ selection }: { selection: PlanSelection }) {
  const { t } = useLocale();
  const name = selection.plan === "solo" ? t("plans.solo") : t("plans.enterprise");
  const detail = [
    selection.tier !== null ? t("plans.capacity", { count: selection.tier }) : null,
    selection.cycle === "monthly" ? t("plans.summaryMonthly") : t("plans.summaryYearly"),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg bg-subtle p-4">
      <div>
        <p className="text-base font-semibold text-text-primary">{t("plans.summary", { plan: name })}</p>
        <p className="text-sm text-text-secondary">{detail}</p>
      </div>
      <Link href="/plans" className="text-sm font-semibold text-primary hover:underline">
        {t("plans.change")}
      </Link>
    </div>
  );
}
