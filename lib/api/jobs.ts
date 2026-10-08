import { mockJobs } from "@/lib/mocks/data";
import { simulateLatency, simulateList } from "@/lib/mocks/latency";
import type { Job, JobInput } from "@/types";

// TODO(backend): wire to real endpoint
export async function listJobs(): Promise<Job[]> {
  return simulateList(mockJobs);
}

// TODO(backend): wire to real endpoint
export async function getJob(id: string): Promise<Job | null> {
  return simulateLatency(mockJobs.find((job) => job.id === id) ?? null);
}

// TODO(backend): wire to real endpoint
export async function createJob(input: JobInput): Promise<Job> {
  const job: Job = {
    ...input,
    id: `job-${mockJobs.length + 1}`,
    status: "draft",
    candidateCount: 0,
    createdAt: new Date().toISOString(),
  };
  mockJobs.push(job);
  return simulateLatency(job);
}
