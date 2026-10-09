import { mockCandidates } from "@/lib/mocks/data";
import { simulateLatency, simulateList } from "@/lib/mocks/latency";
import type { Candidate, CandidateStage } from "@/types";

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
