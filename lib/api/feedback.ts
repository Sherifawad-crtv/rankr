import { simulateLatency } from "@/lib/mocks/latency";
import type { RunRating } from "@/types";

// TODO(backend): wire to real endpoint
export async function submitRunRating(jobId: string, rating: RunRating): Promise<void> {
  void jobId;
  void rating;
  await simulateLatency(undefined, 400);
}
