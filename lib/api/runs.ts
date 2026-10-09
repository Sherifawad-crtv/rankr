import { mockRuns } from "@/lib/mocks/data";
import { simulateList } from "@/lib/mocks/latency";
import type { ScreeningRun } from "@/types";

// TODO(backend): wire to real endpoint. Most recent first.
export async function listRuns(): Promise<ScreeningRun[]> {
  return simulateList(mockRuns);
}
