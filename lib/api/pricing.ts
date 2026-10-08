import { mockPricing } from "@/lib/mocks/data";
import { simulateLatency } from "@/lib/mocks/latency";
import type { PricingCatalog } from "@/types";

// TODO(backend): wire to real endpoint
export async function getPricing(): Promise<PricingCatalog> {
  return simulateLatency(mockPricing);
}
