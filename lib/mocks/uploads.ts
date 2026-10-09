import type { UploadProgress, UploadQuota } from "@/types";
import { getMockScenario } from "./scenario";

const HOURLY_LIMIT = 20;
const RESETS_IN_MINUTES = 42;
const TICK_MS = 80;
const SCAN_MS = 800;

let usedThisHour = 3;

export function readQuota(): UploadQuota {
  const exhausted = getMockScenario() === "rate-limited";
  return {
    limit: HOURLY_LIMIT,
    used: exhausted ? HOURLY_LIMIT : usedThisHour,
    resetsInMinutes: RESETS_IN_MINUTES,
  };
}

/** Counts one upload against the hourly allowance. Returns false when the allowance is spent. */
export function consumeQuota(): boolean {
  if (readQuota().used >= HOURLY_LIMIT) return false;
  usedThisHour += 1;
  return true;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Pretends to upload `total` files (longer for bigger batches), then to scan them for viruses. */
export async function simulateUpload(
  total: number,
  onProgress?: (progress: UploadProgress) => void,
): Promise<void> {
  const duration = Math.min(4000, Math.max(1200, total * 30));
  const step = Math.max(1, Math.ceil(total / (duration / TICK_MS)));
  for (let done = 0; done < total; ) {
    await wait(TICK_MS);
    done = Math.min(total, done + step);
    onProgress?.({ phase: "uploading", done, total });
  }
  onProgress?.({ phase: "scanning", done: total, total });
  await wait(SCAN_MS);
}
