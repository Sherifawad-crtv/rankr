"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, ErrorPanel, Grid, Icon, LoadingPanel, Segmented, TierSlider } from "@/components/ui";
import { useLocale } from "@/lib/i18n/locale-context";
import { planQuery } from "@/lib/entry-flow";
import { usePricing } from "@/lib/hooks/use-pricing";
import { monthlyPrice } from "@/lib/pricing";
import type { BillingCycle, EnterpriseCvTier } from "@/types";
import { PriceDisplay } from "./price-display";

function PlanFeature({ children }: { children: string }) {
  return (
    <li className="flex items-start gap-2 text-base text-text-primary">
      <Icon name="check" size={18} className="mt-0.5 shrink-0 text-match" />
      {children}
    </li>
  );
}

export function PlansView() {
  const { t } = useLocale();
  const { state, retry } = usePricing();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [tier, setTier] = useState<EnterpriseCvTier>(500);

  if (state.status === "loading") return <LoadingPanel label={t("plans.loading")} />;
  if (state.status === "error") return <ErrorPanel message={t("plans.error")} onRetry={retry} />;

  const pricing = state.data;
  const savings = pricing.yearlyDiscountPercent;
  const soloPrice = monthlyPrice(pricing.solo.pricePerMonth, cycle, savings);
  const enterprisePrice = monthlyPrice(pricing.enterpriseTiers[tier], cycle, savings);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-xl font-bold text-text-primary">{t("plans.title")}</h1>
        <p className="max-w-xl text-base text-text-secondary">
          {t("plans.subtitle")}
        </p>
        <Segmented
          label={t("plans.cycle")}
          value={cycle}
          onChange={setCycle}
          options={[
            { value: "monthly", label: t("plans.monthly") },
            { value: "yearly", label: t("plans.yearly") },
          ]}
        />
      </div>

      <Grid>
        <Card className="col-span-4 flex flex-col gap-6 lg:col-span-5 lg:col-start-2">
          <h2 className="text-lg font-semibold text-text-primary">{t("plans.solo")}</h2>
          <PriceDisplay
            perMonth={soloPrice}
            currency={pricing.currency}
            cycle={cycle}
            savingsPercent={savings}
          />
          <p className="text-base text-text-secondary">
            {/* TODO(spec): Solo capacity is OPEN */}
            {pricing.solo.cvCapacity === null
              ? t("plans.capacityTbc")
              : t("plans.capacity", { count: pricing.solo.cvCapacity })}
          </p>
          <ul className="flex flex-1 flex-col gap-2">
            <PlanFeature>{t("plans.solo.f1")}</PlanFeature>
          </ul>
          <Link href={`/create-account?${planQuery({ plan: "solo", tier: null, cycle })}`} className="contents">
            <Button size="lg">{t("plans.chooseSolo")}</Button>
          </Link>
        </Card>

        <Card className="col-span-4 flex flex-col gap-6 lg:col-span-5">
          <h2 className="text-lg font-semibold text-text-primary">{t("plans.enterprise")}</h2>
          <TierSlider value={tier} onChange={setTier} />
          <PriceDisplay
            perMonth={enterprisePrice}
            currency={pricing.currency}
            cycle={cycle}
            savingsPercent={savings}
          />
          <ul className="flex flex-1 flex-col gap-2">
            <PlanFeature>{t("plans.enterprise.f1")}</PlanFeature>
            <PlanFeature>{t("plans.enterprise.f2")}</PlanFeature>
            <PlanFeature>{t("plans.enterprise.f3")}</PlanFeature>
          </ul>
          <Link
            href={`/create-account?${planQuery({ plan: "enterprise", tier, cycle })}`}
            className="contents"
          >
            <Button size="lg">{t("plans.chooseEnterprise")}</Button>
          </Link>
        </Card>
      </Grid>
    </div>
  );
}
