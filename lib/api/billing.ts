import { mockPlans } from "@/lib/mocks/data";
import { simulateLatency } from "@/lib/mocks/latency";
import type { Plan, PlanMode } from "@/types";

// TODO(backend): wire to real endpoint
export async function getPlan(mode: PlanMode): Promise<Plan> {
  return simulateLatency(mockPlans[mode]);
}
