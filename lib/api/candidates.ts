import { mockCandidates } from "@/lib/mocks/data";
import { simulateLatency, simulateList } from "@/lib/mocks/latency";
import type { Candidate } from "@/types";

// TODO(backend): wire to real endpoint
export async function listCandidates(jobId: string): Promise<Candidate[]> {
  return simulateList(mockCandidates.filter((c) => c.jobId === jobId));
}

// TODO(backend): wire to real endpoint
export async function getCandidate(id: string): Promise<Candidate | null> {
  return simulateLatency(mockCandidates.find((c) => c.id === id) ?? null);
}
