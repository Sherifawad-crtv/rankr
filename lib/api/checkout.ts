import { simulateLatency } from "@/lib/mocks/latency";
import type { PlanSelection } from "@/types";

// TODO(backend): wire to real endpoint. Should create the payment session (Paymob/Stripe)
// and resolve once payment succeeds; reject if it is declined or fails.
export async function startCheckout(selection: PlanSelection): Promise<void> {
  void selection;
  await simulateLatency(undefined, 800);
}
