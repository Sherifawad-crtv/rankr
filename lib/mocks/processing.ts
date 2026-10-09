import { PROCESSING_STEPS, type Candidate, type ProcessingBatch, type UploadedCV } from "@/types";
import { mockCandidates, mockJobs, mockPlans } from "./data";

interface StoredBatch {
  jobId: string;
  startedAt: number;
  files: Array<{ id: string; fileName: string }>;
  finalized: boolean;
}

const batches = new Map<string, StoredBatch>();
/** Each CV takes this long end to end, split evenly across the four steps. */
const FILE_DURATION_MS = 5200;
const MAX_STAGGER_MS = 140;
const MAX_TOTAL_STAGGER_MS = 2400;

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
    stage: "new",
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

  const stagger = Math.min(MAX_STAGGER_MS, MAX_TOTAL_STAGGER_MS / batch.files.length);
  const elapsed = Date.now() - batch.startedAt;
  const stepMs = FILE_DURATION_MS / PROCESSING_STEPS.length;

  const files: UploadedCV[] = batch.files.map((file, index) => {
    const t = elapsed - index * stagger;
    const base = { id: file.id, jobId, fileName: file.fileName };
    if (t < 0) return { ...base, status: "pending", step: null };
    // Unreadable files fail at the "reading" step.
    if (failed(file.fileName) && t >= stepMs * 2) return { ...base, status: "failed", step: null };
    if (t >= FILE_DURATION_MS) return { ...base, status: "done", step: null };
    return { ...base, status: "processing", step: PROCESSING_STEPS[Math.floor(t / stepMs)] };
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
