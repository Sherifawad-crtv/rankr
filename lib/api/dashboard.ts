import { mockCandidates, mockJobs, mockPlans } from "@/lib/mocks/data";
import { simulateLatency } from "@/lib/mocks/latency";
import { getMockScenario } from "@/lib/mocks/scenario";
import type { DashboardSummary, PlanMode } from "@/types";

const RECENT_LIMIT = 5;

// TODO(backend): wire to real endpoint
export async function getDashboard(mode: PlanMode): Promise<DashboardSummary> {
  const recentCandidates = [...mockCandidates]
    .reverse()
    .slice(0, RECENT_LIMIT)
    .map((candidate) => ({
      id: candidate.id,
      jobId: candidate.jobId,
      jobTitle: mockJobs.find((job) => job.id === candidate.jobId)?.title ?? "Unknown job",
      fullName: candidate.cv.fullName,
      stage: candidate.stage,
      lowConfidence: candidate.lowConfidence,
    }));

  if (getMockScenario() === "empty") {
    return simulateLatency({
      plan: mockPlans[mode],
      jobs: [],
      recentCandidates: [],
      totalCandidates: 0,
      needsReviewCount: 0,
      filteredOutCount: 0,
    });
  }

  return simulateLatency({
    plan: mockPlans[mode],
    jobs: mockJobs,
    recentCandidates,
    totalCandidates: mockCandidates.length,
    needsReviewCount: mockCandidates.filter((c) => c.lowConfidence).length,
    filteredOutCount: mockCandidates.filter((c) => c.filteredOut).length,
  });
}
