import type { Candidate, ProcessingBatch, UploadedCV } from "@/types";
import { mockCandidates, mockJobs, mockPlans } from "./data";

interface StoredBatch {
  jobId: string;
  startedAt: number;
  files: Array<{ id: string; fileName: string }>;
  finalized: boolean;
}

const batches = new Map<string, StoredBatch>();
const MAX_PER_FILE_MS = 1200;
const MAX_TOTAL_MS = 8000;

function hash(text: string): number {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

function failed(fileName: string): boolean {
  return /fail/i.test(fileName);
}

function candidateFromFile(jobId: string, id: string, fileName: string): Candidate {
  const seed = hash(fileName);
  const base = fileName.replace(/\.[^.]+$/, "").replace(/[-_.]+/g, " ").trim();
  const name = base.replace(/\b\w/g, (letter) => letter.toUpperCase());
  const score = (shift: number) => 20 + ((seed >>> shift) % 76);
  const lowConfidence = seed % 5 === 0;
  const job = mockJobs.find((item) => item.id === jobId);

  return {
    id,
    jobId,
    cv: {
      fullName: name || "Unnamed candidate",
      email: `${base.toLowerCase().replace(/\s+/g, ".") || "candidate"}@example.com`,
      phone: null,
      skills: ["Skill A", "Skill B", "Skill C"].slice(0, 1 + (seed % 3)),
      experienceYears: 1 + (seed % 9),
      education: ["Degree"],
      confidence: lowConfidence ? 0.3 + (seed % 20) / 100 : 0.8 + (seed % 18) / 100,
    },
    breakdown: {
      skills: score(0),
      experience: score(3),
      education: score(6),
      profileQuality: score(9),
    },
    stage: "applied",
    lowConfidence,
    filteredOut:
      seed % 7 === 0
        ? { reason: job?.hardFilters[0]?.label ?? "Did not meet a required filter" }
        : null,
  };
}

export function createBatch(jobId: string, fileNames: string[]): void {
  const stamp = Date.now();
  batches.set(jobId, {
    jobId,
    startedAt: stamp,
    files: fileNames.map((fileName, index) => ({ id: `cv-${stamp}-${index}`, fileName })),
    finalized: false,
  });
}

/** Derives each file's status from elapsed time; adds candidates once the whole batch is done. */
export function readBatch(jobId: string): ProcessingBatch | null {
  const batch = batches.get(jobId);
  if (!batch) return null;

  const perFile = Math.min(MAX_PER_FILE_MS, MAX_TOTAL_MS / batch.files.length);
  const elapsed = Date.now() - batch.startedAt;

  const files: UploadedCV[] = batch.files.map((file, index) => {
    const status =
      elapsed < index * perFile
        ? "queued"
        : elapsed < (index + 1) * perFile
          ? "processing"
          : failed(file.fileName)
            ? "failed"
            : "done";
    return { id: file.id, jobId, fileName: file.fileName, status };
  });

  const finished = files.every((file) => file.status === "done" || file.status === "failed");
  if (finished && !batch.finalized) {
    batch.finalized = true;
    const added = files.filter((file) => file.status === "done");
    mockCandidates.push(...added.map((file) => candidateFromFile(jobId, file.id, file.fileName)));
    const job = mockJobs.find((item) => item.id === jobId);
    if (job) job.candidateCount += added.length;
    for (const plan of Object.values(mockPlans)) plan.cvUsed += added.length;
  }

  return { jobId, files };
}
