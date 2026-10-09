import { SCORE_DIMENSIONS, type Candidate, type ScoreDimension, type ScoreWeights } from "@/types";

export function weightsTotal(weights: ScoreWeights): number {
  return SCORE_DIMENSIONS.reduce((sum, dimension) => sum + weights[dimension], 0);
}

/** Weighted 0-100 score for a candidate. */
export function weightedScore(candidate: Candidate, weights: ScoreWeights): number {
  const total = SCORE_DIMENSIONS.reduce(
    (sum, dimension) => sum + candidate.breakdown[dimension] * weights[dimension],
    0,
  );
  return total / 100;
}

/**
 * The match score shown to recruiters: the weighted score multiplied by parse confidence, so
 * low-confidence CVs rank lower (they also carry a visible indicator).
 */
export function matchScore(candidate: Candidate, weights: ScoreWeights): number {
  return weightedScore(candidate, weights) * candidate.cv.confidence;
}

/**
 * Sets one weight and spreads the remainder over the others in proportion, so the
 * total always stays exactly 100. TODO(spec): confirm this is the intended slider behaviour.
 */
export function rebalanceWeights(
  weights: ScoreWeights,
  changed: ScoreDimension,
  value: number,
): ScoreWeights {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const others = SCORE_DIMENSIONS.filter((dimension) => dimension !== changed);
  const remaining = 100 - clamped;
  const otherTotal = others.reduce((sum, dimension) => sum + weights[dimension], 0);

  const next = { ...weights, [changed]: clamped };
  let assigned = 0;
  for (const dimension of others) {
    const share =
      otherTotal === 0 ? remaining / others.length : (weights[dimension] / otherTotal) * remaining;
    next[dimension] = Math.floor(share);
    assigned += next[dimension];
  }
  for (let left = remaining - assigned, i = 0; left > 0; left--, i = (i + 1) % others.length) {
    next[others[i]] += 1;
  }
  return next;
}

/** Client-side re-rank: ranked candidates first, knocked-out candidates kept in their own group. */
export function rankCandidates(candidates: Candidate[], weights: ScoreWeights) {
  const ranked = candidates
    .filter((candidate) => !candidate.filteredOut)
    .sort((a, b) => matchScore(b, weights) - matchScore(a, weights));
  const filteredOut = candidates.filter((candidate) => candidate.filteredOut);
  return { ranked, filteredOut };
}
