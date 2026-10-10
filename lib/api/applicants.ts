import { mockCandidates, mockJobs } from "@/lib/mocks/data";
import { simulateList } from "@/lib/mocks/latency";
import { matchScore } from "@/lib/scoring";
import type { Applicant } from "@/types";

// TODO(backend): wire to real endpoint. Every candidate across the company's jobs, with the job they belong to and how they arrived.
export async function listApplicants(): Promise<Applicant[]> {
  const rows = mockCandidates.flatMap((candidate) => {
    const job = mockJobs.find((item) => item.id === candidate.jobId);
    if (!job) return [];
    return [
      {
        candidate,
        jobId: job.id,
        jobTitle: job.title,
        matchPercent: Math.round(matchScore(candidate, job.weights)),
        addedAt: candidate.addedAt,
      },
    ];
  });
  return simulateList(rows);
}
