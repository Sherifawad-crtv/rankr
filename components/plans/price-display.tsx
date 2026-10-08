import { Badge } from "@/components/ui";
import { formatPrice } from "@/lib/pricing";
import type { BillingCycle } from "@/types";

interface PriceDisplayProps {
  perMonth: number | null;
  currency: string | null;
  cycle: BillingCycle;
  savingsPercent: number | null;
}

export function PriceDisplay({ perMonth, currency, cycle, savingsPercent }: PriceDisplayProps) {
  if (perMonth === null || currency === null) {
    // TODO(spec): prices and yearly discount are OPEN
    return <p className="text-lg text-text-secondary">Pricing to be confirmed</p>;
  }
  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-baseline gap-1">
        <span className="text-xl font-medium text-text-primary">{formatPrice(perMonth, currency)}</span>
        <span className="text-base text-text-secondary">/ month</span>
        {cycle === "yearly" && savingsPercent !== null && (
          <Badge tone="match" className="ms-2">
            Save {savingsPercent}%
          </Badge>
        )}
      </p>
      <p className="text-sm text-text-secondary">
        {cycle === "monthly" ? "Billed monthly" : "Billed annually"}
      </p>
    </div>
  );
}
