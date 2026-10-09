"use client";

import { Badge } from "@/components/ui";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatPrice } from "@/lib/pricing";
import type { BillingCycle } from "@/types";

interface PriceDisplayProps {
  perMonth: number | null;
  currency: string | null;
  cycle: BillingCycle;
  savingsPercent: number | null;
}

export function PriceDisplay({ perMonth, currency, cycle, savingsPercent }: PriceDisplayProps) {
  const { t } = useLocale();
  if (perMonth === null || currency === null) {
    // TODO(spec): prices and yearly discount are OPEN
    return <p className="text-lg text-text-secondary">{t("plans.pricingTbc")}</p>;
  }
  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-text-primary">{formatPrice(perMonth, currency)}</span>
        <span className="text-base text-text-secondary">{t("plans.perMonth")}</span>
        {cycle === "yearly" && savingsPercent !== null && (
          <Badge tone="match" className="ms-2">
            {t("plans.save", { percent: savingsPercent })}
          </Badge>
        )}
      </p>
      <p className="text-sm text-text-secondary">
        {cycle === "monthly" ? t("plans.billedMonthly") : t("plans.billedAnnually")}
      </p>
    </div>
  );
}
