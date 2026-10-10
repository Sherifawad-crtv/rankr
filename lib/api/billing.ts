import { mockPlans } from "@/lib/mocks/data";
import { mockBilling } from "@/lib/mocks/billing";
import { getMockScenario } from "@/lib/mocks/scenario";
import { simulateLatency } from "@/lib/mocks/latency";
import type { BillingOverview, Plan, PlanChange, PlanMode } from "@/types";

const SAVE_MS = 700;

// TODO(backend): wire to real endpoint
export async function getPlan(mode: PlanMode): Promise<Plan> {
  return simulateLatency({ ...mockPlans[mode] });
}

// TODO(backend): wire to real endpoint
export async function getBillingOverview(mode: PlanMode): Promise<BillingOverview> {
  const empty = getMockScenario() === "empty";
  return simulateLatency({
    plan: { ...mockPlans[mode] },
    currency: null, // TODO(spec): currency is OPEN
    renewsAt: mockBilling.renewsAt,
    invoices: empty ? [] : mockBilling.invoices.map((invoice) => ({ ...invoice })),
  });
}

// TODO(backend): wire to real endpoint. Payment is handled by the provider's hosted page.
// TODO(spec): does a change apply now or at the next renewal, and what happens if the new capacity is below CVs already used?
export async function updatePlan(mode: PlanMode, change: PlanChange): Promise<Plan> {
  const plan = mockPlans[mode];
  plan.billingCycle = change.cycle;
  if (mode === "enterprise" && change.tier !== null) plan.cvCapacity = change.tier;
  return simulateLatency({ ...plan }, SAVE_MS);
}
