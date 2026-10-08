import type { Candidate, ScoreWeights } from "@/types";

export function weightsTotal(weights: ScoreWeights): number {
  return Object.values(weights).reduce((sum, value) => sum + value, 0);
}

export function weightedScore(candidate: Candidate, weights: ScoreWeights): number {
  const { breakdown } = candidate;
  const total =
    breakdown.skills * weights.skills +
    breakdown.experience * weights.experience +
    breakdown.education * weights.education +
    breakdown.profileQuality * weights.profileQuality;
  return total / 100;
}

/** Client-side re-rank: ranked candidates first, knocked-out candidates kept in their own group. */
export function rankCandidates(candidates: Candidate[], weights: ScoreWeights) {
  const ranked = candidates
    .filter((c) => !c.filteredOut)
    .sort((a, b) => weightedScore(b, weights) - weightedScore(a, weights));
  const filteredOut = candidates.filter((c) => c.filteredOut);
  return { ranked, filteredOut };
}
