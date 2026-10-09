import { mockCandidates } from "@/lib/mocks/data";
import { simulateLatency, simulateList } from "@/lib/mocks/latency";
import { getMockScenario } from "@/lib/mocks/scenario";
import type { Candidate, CandidateStage, CvLink } from "@/types";

// TODO(backend): wire to real endpoint
export async function listCandidates(jobId: string): Promise<Candidate[]> {
  return simulateList(mockCandidates.filter((c) => c.jobId === jobId));
}

// TODO(backend): wire to real endpoint
export async function getCandidate(id: string): Promise<Candidate | null> {
  return simulateLatency(mockCandidates.find((c) => c.id === id) ?? null);
}

// TODO(backend): wire to real endpoint. Stores each change as a feedback signal (shortlist, reject,
// hire) for future scoring recalibration. The person decides; the system never changes a stage itself.
export async function setCandidateStage(candidateIds: string[], stage: CandidateStage): Promise<void> {
  for (const candidate of mockCandidates) {
    if (candidateIds.includes(candidate.id)) candidate.stage = stage;
  }
  await simulateLatency(undefined, 500);
}

// TODO(backend): wire to real endpoint. Returns a signed URL to the private CV file that expires
// after one hour. CVs are never exposed through public links.
export async function getCandidateCvLink(candidateId: string): Promise<CvLink> {
  void candidateId;
  // Use ?mock=expired-link to see the expired state after a few seconds.
  const expiresInSeconds = getMockScenario() === "expired-link" ? 3 : 60 * 60;
  return simulateLatency({ url: "/mock-cv.html", expiresInSeconds }, 400);
}
