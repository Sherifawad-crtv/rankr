import type { CandidateStage } from "@/types";

/** Product events we track. Keep this list small and tied to the PRD success metrics. */
export type AnalyticsEvent =
  | { name: "cv_batch_submitted"; count: number }
  | { name: "run_completed"; total: number; failed: number }
  | { name: "ranked_list_viewed"; candidates: number }
  | { name: "weights_changed" }
  | { name: "candidate_stage_changed"; stage: CandidateStage; count: number };

// TODO(backend): send to PostHog. Until then events are dropped.
export function track(event: AnalyticsEvent): void {
  void event;
}
