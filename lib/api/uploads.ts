import { createBatch, readBatch } from "@/lib/mocks/processing";
import { simulateLatency } from "@/lib/mocks/latency";
import type { ProcessingBatch } from "@/types";

// TODO(backend): wire to real endpoint. Uploads the files (multipart) and queues them for
// parsing and scoring. Should reject if the batch would exceed the plan's CV capacity.
export async function submitCVBatch(jobId: string, files: File[]): Promise<void> {
  createBatch(
    jobId,
    files.map((file) => file.name),
  );
  await simulateLatency(undefined, 600);
}

// TODO(backend): wire to real endpoint. Polled while processing; null if no batch exists.
export async function getProcessingStatus(jobId: string): Promise<ProcessingBatch | null> {
  return simulateLatency(readBatch(jobId), 200);
}
