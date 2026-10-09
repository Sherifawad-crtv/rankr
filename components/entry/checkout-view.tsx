"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, ErrorPanel, LoadingPanel } from "@/components/ui";
import { startCheckout } from "@/lib/api";
import { planQuery } from "@/lib/entry-flow";
import { usePricing } from "@/lib/hooks/use-pricing";
import { useLocale } from "@/lib/i18n/locale-context";
import { billedToday, formatPrice, monthlyPrice } from "@/lib/pricing";
import type { PlanSelection } from "@/types";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border-default py-3 last:border-b-0">
      <dt className="text-base text-text-secondary">{label}</dt>
      <dd className="text-end text-base text-text-primary">{value}</dd>
    </div>
  );
}

export function CheckoutView({ selection }: { selection: PlanSelection }) {
  const router = useRouter();
  const { t } = useLocale();
  const { state, retry } = usePricing();
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(false);

  if (state.status === "loading") return <LoadingPanel label={t("checkout.loading")} />;
  if (state.status === "error") return <ErrorPanel message={t("checkout.loadError")} onRetry={retry} />;

  const pricing = state.data;
  const baseMonthly =
    selection.plan === "solo"
      ? pricing.solo.pricePerMonth
      : selection.tier === null
        ? null
        : pricing.enterpriseTiers[selection.tier];
  const perMonth = monthlyPrice(baseMonthly, selection.cycle, pricing.yearlyDiscountPercent);
  const total = billedToday(perMonth, selection.cycle);
  const { currency } = pricing;
  const tbc = t("checkout.tbc"); // TODO(spec): prices, discount and currency are OPEN

  const capacity =
    selection.plan === "enterprise" && selection.tier !== null
      ? t("plans.capacity", { count: selection.tier })
      : pricing.solo.cvCapacity === null
        ? tbc // TODO(spec): Solo capacity is OPEN
        : t("plans.capacity", { count: pricing.solo.cvCapacity });

  async function onPay() {
    setPaying(true);
    setPaymentError(false);
    try {
      await startCheckout(selection);
      router.push(`/workspace-setup?${planQuery(selection)}`);
    } catch {
      setPaymentError(true);
      setPaying(false);
    }
  }

  return (
    <Card className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">{t("checkout.title")}</h1>
        <p className="mt-1 text-base text-text-secondary">{t("checkout.subtitle")}</p>
      </div>

      <dl>
        <Row label={t("checkout.plan")} value={selection.plan === "solo" ? t("plans.solo") : t("plans.enterprise")} />
        <Row label={t("checkout.capacity")} value={capacity} />
        <Row
          label={t("checkout.billing")}
          value={selection.cycle === "monthly" ? t("checkout.billingMonthly") : t("checkout.billingYearly")}
        />
        <Row
          label={t("checkout.perMonth")}
          value={perMonth !== null && currency !== null ? formatPrice(perMonth, currency) : tbc}
        />
        <Row
          label={selection.cycle === "monthly" ? t("checkout.billedToday") : t("checkout.billedToday12")}
          value={total !== null && currency !== null ? formatPrice(total, currency) : tbc}
        />
      </dl>

      {paymentError && (
        <p role="alert" className="text-sm text-danger">
          {t("checkout.payError")}
        </p>
      )}

      <Button size="lg" loading={paying} onClick={onPay}>
        {paying ? t("checkout.processing") : t("checkout.pay")}
      </Button>
      <Link href="/plans" className="text-center text-sm font-semibold text-primary hover:underline">
        {t("plans.change")}
      </Link>
    </Card>
  );
}
