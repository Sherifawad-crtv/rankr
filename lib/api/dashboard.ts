import { mockCandidates, mockJobs, mockPlans, mockRuns } from "@/lib/mocks/data";
import { simulateLatency } from "@/lib/mocks/latency";
import { getMockScenario } from "@/lib/mocks/scenario";
import { matchScore } from "@/lib/scoring";
import type { DashboardSummary, PlanMode } from "@/types";

const RECENT_RUNS = 5;
const TOP_MATCHES = 3;

// TODO(backend): wire to real endpoint
export async function getDashboard(mode: PlanMode): Promise<DashboardSummary> {
  if (getMockScenario() === "empty") {
    return simulateLatency({
      plan: mockPlans[mode],
      jobs: [],
      recentRuns: [],
      topMatches: [],
      totalCandidates: 0,
      shortlistedCount: 0,
      needsReviewCount: 0,
    });
  }

  const openJobIds = new Set(mockJobs.filter((job) => job.status === "open").map((job) => job.id));
  const topMatches = mockCandidates
    .filter((c) => openJobIds.has(c.jobId) && !c.filteredOut && c.stage !== "rejected")
    .map((c) => {
      const job = mockJobs.find((item) => item.id === c.jobId);
      return job ? { c, job, score: matchScore(c, job.weights) } : null;
    })
    .filter((item) => item !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_MATCHES)
    .map(({ c, job, score }) => ({
      candidateId: c.id,
      jobId: job.id,
      jobTitle: job.title,
      fullName: c.cv.fullName,
      matchPercent: Math.round(score),
      lowConfidence: c.lowConfidence,
    }));

  return simulateLatency({
    plan: mockPlans[mode],
    jobs: mockJobs.map((job) => ({
      ...job,
      shortlistedCount: mockCandidates.filter((c) => c.jobId === job.id && c.stage === "shortlisted").length,
    })),
    recentRuns: mockRuns.slice(0, RECENT_RUNS),
    topMatches,
    totalCandidates: mockCandidates.length,
    shortlistedCount: mockCandidates.filter((c) => c.stage === "shortlisted").length,
    needsReviewCount: mockCandidates.filter((c) => c.lowConfidence).length,
  });
}
