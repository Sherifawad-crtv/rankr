import type { BillingCycle } from "@/types";

/** Per-month price for a cycle, or null while the price or discount is still OPEN. */
export function monthlyPrice(
  basePerMonth: number | null,
  cycle: BillingCycle,
  yearlyDiscountPercent: number | null,
): number | null {
  if (basePerMonth === null) return null;
  if (cycle === "monthly") return basePerMonth;
  if (yearlyDiscountPercent === null) return null;
  return basePerMonth * (1 - yearlyDiscountPercent / 100);
}

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Amount charged at checkout: one month, or twelve months upfront for yearly. */
export function billedToday(perMonth: number | null, cycle: BillingCycle): number | null {
  if (perMonth === null) return null;
  return cycle === "yearly" ? perMonth * 12 : perMonth;
}
