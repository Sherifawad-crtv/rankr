import { createBatch, readBatch } from "@/lib/mocks/processing";
import { simulateLatency } from "@/lib/mocks/latency";
import { consumeQuota, readQuota, simulateUpload } from "@/lib/mocks/uploads";
import type { ProcessingBatch, UploadProgress, UploadQuota } from "@/types";

/** Thrown when the hourly upload allowance is spent. */
export class RateLimitError extends Error {
  constructor(readonly resetsInMinutes: number) {
    super("Hourly upload limit reached");
  }
}

// TODO(backend): wire to real endpoint. Hourly allowance per user (20 uploads per hour).
export async function getUploadQuota(): Promise<UploadQuota> {
  return simulateLatency(readQuota(), 200);
}

// TODO(backend): wire to real endpoint. Uploads the files (multipart) with progress, scans them
// for viruses, and queues them for parsing and scoring. Should reject with a rate-limit error when
// the hourly allowance is spent, and when the batch exceeds the plan's CV capacity or 500 CVs.
export async function submitCVBatch(
  jobId: string,
  files: File[],
  onProgress?: (progress: UploadProgress) => void,
): Promise<void> {
  await simulateLatency(undefined, 150);
  if (!consumeQuota()) throw new RateLimitError(readQuota().resetsInMinutes);
  await simulateUpload(files.length, onProgress);
  createBatch(
    jobId,
    files.map((file) => file.name),
  );
}

// TODO(backend): wire to real endpoint. Polled while processing; null if no batch exists.
export async function getProcessingStatus(jobId: string): Promise<ProcessingBatch | null> {
  return simulateLatency(readBatch(jobId), 200);
}
