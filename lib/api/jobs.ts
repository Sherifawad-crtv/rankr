import { mockJobs } from "@/lib/mocks/data";
import { simulateLatency, simulateList } from "@/lib/mocks/latency";
import { slugify } from "@/lib/careers";
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
export async function updateJob(id: string, input: JobInput): Promise<Job> {
  const job = mockJobs.find((item) => item.id === id);
  if (!job) throw new Error(`Unknown job: ${id}`);
  Object.assign(job, input);
  return simulateLatency(job, 600);
}

// TODO(backend): wire to real endpoint
export async function createJob(input: JobInput): Promise<Job> {
  const job: Job = {
    ...input,
    id: `job-${mockJobs.length + 1}`,
    slug: slugify(input.title),
    acceptingApplications: false,
    status: "open",
    candidateCount: 0,
    createdAt: new Date().toISOString(),
  };
  mockJobs.push(job);
  return simulateLatency(job, 600);
}
