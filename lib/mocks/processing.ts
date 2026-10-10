import {
  PROCESSING_STEPS,
  type Candidate,
  type Job,
  type ProcessingBatch,
  type SkillRef,
  type UploadedCV,
} from "@/types";
import { describeHardFilter } from "@/lib/hardfilters";
import { mockCandidates, mockJobs, mockPlans, mockRuns } from "./data";
import { mockSkills, skillRef } from "./skills";

interface StoredFile {
  id: string;
  fileName: string;
  /** Set when the file was retried; its timeline restarts from this moment. */
  restartedAt: number | null;
  /** How many times it was retried. Only a first attempt can fail in the mock. */
  retries: number;
  /** Its candidate has been added to the results. */
  counted: boolean;
}

interface StoredBatch {
  jobId: string;
  runId: string;
  startedAt: number;
  files: StoredFile[];
  /** Files identical to a CV already processed (or earlier in this batch); their result is reused. */
  duplicateIds: Set<string>;
}

const batches = new Map<string, StoredBatch>();
/** Each CV takes this long end to end, split evenly across the four steps. */
const FILE_DURATION_MS = 5200;
const MAX_STAGGER_MS = 140;
const MAX_TOTAL_STAGGER_MS = 2400;
const STEP_MS = FILE_DURATION_MS / PROCESSING_STEPS.length;
/** Unreadable files fail at the end of the "reading" step. */
const FAIL_AT_MS = STEP_MS * 2;

function hash(text: string): number {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

/** Same person's CV in another file type or spelling resolves to the same key. */
function dedupeKey(text: string): string {
  return text
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function failed(fileName: string): boolean {
  return /fail/i.test(fileName);
}

export function candidateFromFile(
  job: Job | undefined,
  runId: string | null,
  id: string,
  fileName: string,
): Candidate {
  const seed = hash(fileName);
  const base = fileName.replace(/\.[^.]+$/, "").replace(/[-_.]+/g, " ").trim();
  const name = base.replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Unnamed candidate";
  const score = (shift: number) => 20 + ((seed >>> shift) % 76);
  const lowConfidence = seed % 5 === 0;
  const experienceYears = 1 + (seed % 9);

  const required = job?.skills.filter((item) => item.tier === "required").map((item) => item.skill) ?? [];
  const others = job?.skills.filter((item) => item.tier !== "required").map((item) => item.skill) ?? [];
  const matchedRequired = required.filter((_, index) => (seed >>> index) % 3 !== 0);
  const missingRequired = required.filter((skill) => !matchedRequired.includes(skill));
  const matchedOthers = others.filter((_, index) => (seed >>> (index + 4)) % 2 === 0);
  const matched: SkillRef[] = [...matchedRequired, ...matchedOthers];
  const extra: SkillRef[] = mockSkills
    .filter((skill) => !job?.skills.some((item) => item.skill.id === skill.id))
    .slice(seed % 5, (seed % 5) + (seed % 3))
    .map((skill) => skillRef(skill.id));

  const hardFilter = job?.hardFilters[0];
  const knockedOut = seed % 7 === 0 && hardFilter;

  const rationale =
    `Matches ${matchedRequired.length} of ${required.length} required skills and has ${experienceYears} ` +
    `${experienceYears === 1 ? "year" : "years"} of experience.` +
    (missingRequired.length > 0 ? ` Missing: ${missingRequired.map((skill) => skill.name.en).join(", ")}.` : "");

  return {
    id,
    jobId: job?.id ?? "",
    runId,
    source: runId === null ? "application" : "upload",
    addedAt: new Date().toISOString(),
    cv: {
      fullName: name,
      fullNameAr: null,
      email: `${base.toLowerCase().replace(/\s+/g, ".") || "candidate"}@example.com`,
      phone: null,
      skills: matched.map((skill) => ({ skillId: skill.id, label: skill.name.en })),
      experienceYears,
      roles: [],
      education: [{ degree: "bachelor", field: "General", institution: "Mock University" }],
      languages: [{ language: "Arabic", level: "native" }],
      confidence: lowConfidence ? 0.3 + (seed % 20) / 100 : 0.8 + (seed % 18) / 100,
    },
    breakdown: {
      skills: score(0),
      experience: score(3),
      education: score(6),
      profileQuality: score(9),
    },
    rationale,
    matchedSkills: matched,
    missingRequiredSkills: missingRequired,
    extraSkills: extra,
    stage: "new",
    lowConfidence,
    ocrUsed: seed % 4 === 0,
    duplicateOf: null,
    filteredOut: knockedOut ? { reason: describeHardFilter(hardFilter) } : null,
  };
}

function ocrUsed(fileName: string): boolean {
  return hash(fileName) % 4 === 0;
}

function lowConfidence(fileName: string): boolean {
  return hash(fileName) % 5 === 0;
}

export function createBatch(jobId: string, fileNames: string[]): void {
  const stamp = Date.now();
  const runId = `run-${stamp}`;
  const files: StoredFile[] = fileNames.map((fileName, index) => ({
    id: `cv-${stamp}-${index}`,
    fileName,
    restartedAt: null,
    retries: 0,
    counted: false,
  }));

  const known = new Set(
    mockCandidates.filter((candidate) => candidate.jobId === jobId).map((c) => dedupeKey(c.cv.fullName)),
  );
  const duplicateIds = new Set<string>();
  for (const file of files) {
    const key = dedupeKey(file.fileName);
    if (known.has(key)) duplicateIds.add(file.id);
    else known.add(key);
  }

  batches.set(jobId, { jobId, runId, startedAt: stamp, files, duplicateIds });
  mockRuns.unshift({
    id: runId,
    jobId,
    jobTitle: mockJobs.find((job) => job.id === jobId)?.title ?? "Unknown job",
    createdAt: new Date(stamp).toISOString(),
    status: "processing",
    total: fileNames.length,
    scored: 0,
    failed: 0,
    duplicates: duplicateIds.size,
  });
}

function startOf(batch: StoredBatch, file: StoredFile, index: number, stagger: number): number {
  return file.restartedAt ?? batch.startedAt + index * stagger;
}

function snapshot(batch: StoredBatch, now: number): UploadedCV[] {
  const stagger = Math.min(MAX_STAGGER_MS, MAX_TOTAL_STAGGER_MS / batch.files.length);
  return batch.files.map((file, index) => {
    const t = now - startOf(batch, file, index, stagger);
    const base = { id: file.id, jobId: batch.jobId, fileName: file.fileName };
    const flagsKnown = batch.duplicateIds.has(file.id) ? false : t >= STEP_MS;

    // A matching hash is detected straight away, so duplicates never wait for the pipeline.
    if (batch.duplicateIds.has(file.id)) {
      return { ...base, isDuplicate: true, status: "done", step: null, error: null, ocrUsed: false, lowConfidence: false };
    }
    const flags = { isDuplicate: false, ocrUsed: flagsKnown && ocrUsed(file.fileName), lowConfidence: flagsKnown && lowConfidence(file.fileName) };
    if (t < 0) return { ...base, ...flags, status: "pending", step: null, error: null };
    if (failed(file.fileName) && file.retries === 0 && t >= FAIL_AT_MS) {
      return { ...base, ...flags, status: "failed", step: null, error: "We couldn't extract any text from this file." };
    }
    if (t >= FILE_DURATION_MS) return { ...base, ...flags, status: "done", step: null, error: null };
    return { ...base, ...flags, status: "processing", step: PROCESSING_STEPS[Math.floor(t / STEP_MS)], error: null };
  });
}

function isSettled(file: UploadedCV): boolean {
  return file.status === "done" || file.status === "failed";
}

/** Derives each file's status from elapsed time; adds candidates as files finish scoring. */
export function readBatch(jobId: string): ProcessingBatch | null {
  const batch = batches.get(jobId);
  if (!batch) return null;

  const now = Date.now();
  const files = snapshot(batch, now);
  const job = mockJobs.find((item) => item.id === jobId);
  const run = mockRuns.find((item) => item.id === batch.runId);

  files.forEach((file, index) => {
    const stored = batch.files[index];
    if (file.status !== "done" || file.isDuplicate || stored.counted) return;
    stored.counted = true;
    mockCandidates.push(candidateFromFile(job, batch.runId, file.id, file.fileName));
    if (job) job.candidateCount += 1;
    for (const plan of Object.values(mockPlans)) plan.cvUsed += 1;
    if (run) run.scored += 1;
  });

  const finished = files.every(isSettled);
  if (run) {
    run.failed = files.filter((file) => file.status === "failed").length;
    run.status = finished ? "completed" : "processing";
  }

  // Time left until the slowest unsettled file finishes.
  const stagger = Math.min(MAX_STAGGER_MS, MAX_TOTAL_STAGGER_MS / batch.files.length);
  const endTimes = files
    .map((file, index) => ({ file, start: startOf(batch, batch.files[index], index, stagger) }))
    .filter(({ file }) => !isSettled(file))
    .map(({ file, start }) =>
      failed(file.fileName) && batch.files.find((item) => item.id === file.id)?.retries === 0
        ? start + FAIL_AT_MS
        : start + FILE_DURATION_MS,
    );
  const etaSeconds = finished ? null : Math.max(1, Math.ceil((Math.max(...endTimes) - now) / 1000));

  return { jobId, runId: batch.runId, files, etaSeconds };
}

/** Sends failed files back through the pipeline. Without `fileIds`, every failed file is retried. */
export function retryFiles(jobId: string, fileIds?: string[]): void {
  const batch = batches.get(jobId);
  if (!batch) return;
  const now = Date.now();
  const current = snapshot(batch, now);
  let offset = 0;
  current.forEach((file, index) => {
    if (file.status !== "failed") return;
    if (fileIds && !fileIds.includes(file.id)) return;
    batch.files[index].retries += 1;
    batch.files[index].restartedAt = now + offset * 100;
    offset += 1;
  });
}
