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

interface StoredBatch {
  jobId: string;
  runId: string;
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

function candidateFromFile(job: Job | undefined, runId: string, id: string, fileName: string): Candidate {
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

export function createBatch(jobId: string, fileNames: string[]): void {
  const stamp = Date.now();
  const runId = `run-${stamp}`;
  batches.set(jobId, {
    jobId,
    runId,
    startedAt: stamp,
    files: fileNames.map((fileName, index) => ({ id: `cv-${stamp}-${index}`, fileName })),
    finalized: false,
  });
  mockRuns.unshift({
    id: runId,
    jobId,
    jobTitle: mockJobs.find((job) => job.id === jobId)?.title ?? "Unknown job",
    createdAt: new Date(stamp).toISOString(),
    status: "processing",
    total: fileNames.length,
    scored: 0,
    failed: 0,
    duplicates: 0,
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
    const base = { id: file.id, jobId, fileName: file.fileName, isDuplicate: false };
    if (t < 0) return { ...base, status: "pending", step: null, error: null };
    // Unreadable files fail at the "reading" step.
    if (failed(file.fileName) && t >= stepMs * 2) {
      return { ...base, status: "failed", step: null, error: "We couldn't extract any text from this file." };
    }
    if (t >= FILE_DURATION_MS) return { ...base, status: "done", step: null, error: null };
    return { ...base, status: "processing", step: PROCESSING_STEPS[Math.floor(t / stepMs)], error: null };
  });

  const finished = files.every((file) => file.status === "done" || file.status === "failed");
  if (finished && !batch.finalized) {
    batch.finalized = true;
    const job = mockJobs.find((item) => item.id === jobId);
    const added = files.filter((file) => file.status === "done");
    mockCandidates.push(...added.map((file) => candidateFromFile(job, batch.runId, file.id, file.fileName)));
    if (job) job.candidateCount += added.length;
    for (const plan of Object.values(mockPlans)) plan.cvUsed += added.length;
    const run = mockRuns.find((item) => item.id === batch.runId);
    if (run) {
      run.status = "completed";
      run.scored = added.length;
      run.failed = files.length - added.length;
    }
  }

  return { jobId, runId: batch.runId, files };
}
