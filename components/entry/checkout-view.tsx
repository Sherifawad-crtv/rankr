"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Icon } from "@/components/ui";
import { startCheckout } from "@/lib/api";
import { planQuery } from "@/lib/entry-flow";
import { usePricing } from "@/lib/hooks/use-pricing";
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
  const { state, retry } = usePricing();
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(false);

  if (state.status === "loading") {
    return (
      <p role="status" className="text-center text-text-secondary">
        Loading your order…
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <Icon name="alert" size={28} className="text-danger" />
        <p className="text-base text-text-primary">We couldn&apos;t load your order.</p>
        <Button onClick={retry}>Try again</Button>
      </Card>
    );
  }

  const pricing = state.data;
  const baseMonthly =
    selection.plan === "solo" ? pricing.solo.pricePerMonth : pricing.enterpriseTiers[selection.tier!];
  const perMonth = monthlyPrice(baseMonthly, selection.cycle, pricing.yearlyDiscountPercent);
  const total = billedToday(perMonth, selection.cycle);
  const priced = perMonth !== null && total !== null && pricing.currency !== null;
  const tbc = "To be confirmed"; // TODO(spec): prices, discount and currency are OPEN

  const capacity =
    selection.plan === "enterprise"
      ? `${selection.tier} CVs per cycle`
      : pricing.solo.cvCapacity === null
        ? tbc // TODO(spec): Solo capacity is OPEN
        : `${pricing.solo.cvCapacity} CVs per cycle`;

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
        <h1 className="text-xl font-bold text-text-primary">Checkout</h1>
        <p className="mt-1 text-base text-text-secondary">
          Review your order. Payment is handled on a secure page.
        </p>
      </div>

      <dl>
        <Row label="Plan" value={selection.plan === "solo" ? "Solo" : "Enterprise"} />
        <Row label="CV capacity" value={capacity} />
        <Row label="Billing" value={selection.cycle === "monthly" ? "Monthly" : "Yearly, billed upfront"} />
        <Row
          label="Price per month"
          value={priced ? formatPrice(perMonth, pricing.currency!) : tbc}
        />
        <Row
          label={selection.cycle === "monthly" ? "Billed today" : "Billed today (12 months)"}
          value={priced ? formatPrice(total, pricing.currency!) : tbc}
        />
      </dl>

      {paymentError && (
        <p role="alert" className="text-sm text-danger">
          Your payment didn&apos;t go through. Please try again.
        </p>
      )}

      <Button size="lg" loading={paying} onClick={onPay}>
        {paying ? "Processing…" : "Continue to payment"}
      </Button>
      <Link
        href="/plans"
        className="text-center text-sm font-medium text-primary hover:underline"
      >
        Change plan
      </Link>
    </Card>
  );
}
