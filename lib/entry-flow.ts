import { ENTERPRISE_CV_TIERS, type EnterpriseCvTier, type PlanSelection } from "@/types";

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Reads the plan chosen on /plans from the URL; null if missing or invalid. */
export function parsePlanSelection(params: RawParams): PlanSelection | null {
  const plan = first(params.plan);
  const cycle = first(params.cycle);
  if ((plan !== "solo" && plan !== "enterprise") || (cycle !== "monthly" && cycle !== "yearly")) {
    return null;
  }
  if (plan === "solo") return { plan, tier: null, cycle };

  const tier = Number(first(params.tier));
  if (!ENTERPRISE_CV_TIERS.includes(tier as EnterpriseCvTier)) return null;
  return { plan, tier: tier as EnterpriseCvTier, cycle };
}

export function planQuery(selection: PlanSelection): string {
  const params = new URLSearchParams({ plan: selection.plan, cycle: selection.cycle });
  if (selection.tier !== null) params.set("tier", String(selection.tier));
  return params.toString();
}
