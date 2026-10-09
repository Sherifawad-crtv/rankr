import type { Candidate } from "@/types";

export type ConfidenceLevel = "high" | "medium" | "low";

// TODO(spec): confidence thresholds are not specified.
const LOW_BELOW = 0.5;
const HIGH_FROM = 0.8;

export function confidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence < LOW_BELOW) return "low";
  return confidence >= HIGH_FROM ? "high" : "medium";
}

/** The back-end's low-confidence flag wins; otherwise the level comes from the parse confidence. */
export function candidateConfidence(candidate: Candidate): ConfidenceLevel {
  if (candidate.lowConfidence) return "low";
  const level = confidenceLevel(candidate.cv.confidence);
  return level === "low" ? "medium" : level;
}
