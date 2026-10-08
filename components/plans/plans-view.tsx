"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, Grid, Icon, Segmented, TierSlider } from "@/components/ui";
import { getPricing } from "@/lib/api";
import { planQuery } from "@/lib/entry-flow";
import { monthlyPrice } from "@/lib/pricing";
import type { BillingCycle, EnterpriseCvTier, PricingCatalog } from "@/types";
import { PriceDisplay } from "./price-display";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; pricing: PricingCatalog };

const cycleOptions: Array<{ value: BillingCycle; label: string }> = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

function PlanFeature({ children }: { children: string }) {
  return (
    <li className="flex items-start gap-2 text-base text-text-primary">
      <Icon name="check" size={18} className="mt-0.5 shrink-0 text-match" />
      {children}
    </li>
  );
}

export function PlansView() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [tier, setTier] = useState<EnterpriseCvTier>(500);

  const fetchPricing = useCallback(() => {
    getPricing().then(
      (pricing) => setState({ status: "ready", pricing }),
      () => setState({ status: "error" }),
    );
  }, []);

  useEffect(fetchPricing, [fetchPricing]);

  function retry() {
    setState({ status: "loading" });
    fetchPricing();
  }

  if (state.status === "loading") {
    return (
      <p role="status" className="text-center text-text-secondary">
        Loading plans…
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <Icon name="alert" size={28} className="text-danger" />
        <p className="text-base text-text-primary">We couldn&apos;t load the plans.</p>
        <Button onClick={retry}>Try again</Button>
      </Card>
    );
  }

  const { pricing } = state;
  const savings = pricing.yearlyDiscountPercent;
  const soloPrice = monthlyPrice(pricing.solo.pricePerMonth, cycle, savings);
  const enterprisePrice = monthlyPrice(pricing.enterpriseTiers[tier], cycle, savings);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-xl font-medium text-text-primary">Choose your plan</h1>
        <p className="max-w-xl text-base text-text-secondary">
          Pricing is based on CV capacity per cycle, not seats.
        </p>
        <Segmented label="Billing cycle" value={cycle} onChange={setCycle} options={cycleOptions} />
      </div>

      <Grid>
        <Card className="col-span-4 flex flex-col gap-6 lg:col-span-5 lg:col-start-2">
          <h2 className="text-lg font-medium text-text-primary">Solo</h2>
          <PriceDisplay
            perMonth={soloPrice}
            currency={pricing.currency}
            cycle={cycle}
            savingsPercent={savings}
          />
          <p className="text-base text-text-secondary">
            {/* TODO(spec): Solo capacity is OPEN */}
            {pricing.solo.cvCapacity === null
              ? "CV capacity to be confirmed"
              : `${pricing.solo.cvCapacity} CVs per cycle`}
          </p>
          <ul className="flex flex-1 flex-col gap-2">
            <PlanFeature>Single user</PlanFeature>
          </ul>
          <Link href={`/create-account?${planQuery({ plan: "solo", tier: null, cycle })}`} className="contents">
            <Button size="lg">Choose Solo</Button>
          </Link>
        </Card>

        <Card className="col-span-4 flex flex-col gap-6 lg:col-span-5">
          <h2 className="text-lg font-medium text-text-primary">Enterprise</h2>
          <TierSlider value={tier} onChange={setTier} />
          <PriceDisplay
            perMonth={enterprisePrice}
            currency={pricing.currency}
            cycle={cycle}
            savingsPercent={savings}
          />
          <ul className="flex flex-1 flex-col gap-2">
            <PlanFeature>Unlimited members</PlanFeature>
            <PlanFeature>CV capacity shared across the team</PlanFeature>
            <PlanFeature>Roles and team messaging</PlanFeature>
          </ul>
          <Link
            href={`/create-account?${planQuery({ plan: "enterprise", tier, cycle })}`}
            className="contents"
          >
            <Button size="lg">Choose Enterprise</Button>
          </Link>
        </Card>
      </Grid>
    </div>
  );
}
