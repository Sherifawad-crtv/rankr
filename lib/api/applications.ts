import { candidateFromFile } from "@/lib/mocks/processing";
import { mockCandidates, mockJobs, mockPlans } from "@/lib/mocks/data";
import { simulateLatency } from "@/lib/mocks/latency";
import { mockSettings } from "@/lib/mocks/settings";
import type { ApplicationInput, CareersPage, Job, OrgPublicProfile, PublicJob } from "@/types";

/** Thrown when someone applies to a job that is no longer taking applications. */
export class ApplicationsClosedError extends Error {}

const SAVE_MS = 500;
const SUBMIT_MS = 900;

function isPublic(job: Job): boolean {
  return job.status === "open" && job.acceptingApplications;
}

function toPublicJob(job: Job): PublicJob {
  return {
    slug: job.slug,
    title: job.title,
    description: job.description,
    location: job.location,
    skills: job.skills.filter((item) => item.tier !== "niceToHave").map((item) => item.skill),
  };
}

function orgProfile(): OrgPublicProfile {
  return { slug: mockSettings.company.slug, branding: structuredClone(mockSettings.company.branding) };
}

// TODO(backend): wire to real endpoint. Recruiter side: the company's public link and look.
export async function getOrgPublicProfile(): Promise<OrgPublicProfile> {
  return simulateLatency(orgProfile(), 200);
}

// TODO(backend): wire to real endpoint. Recruiter side: opens or closes a job's public apply page.
export async function setAcceptingApplications(jobId: string, accepting: boolean): Promise<Job> {
  const job = mockJobs.find((item) => item.id === jobId);
  if (!job) throw new Error(`Unknown job: ${jobId}`);
  job.acceptingApplications = accepting;
  return simulateLatency({ ...job }, SAVE_MS);
}

// TODO(backend): wire to real endpoint. Public, no sign-in. Null when the company does not exist.
// Lists only jobs that are open and taking applications.
export async function getCareersPage(orgSlug: string): Promise<CareersPage | null> {
  const org = orgProfile();
  if (org.slug !== orgSlug) return simulateLatency(null);
  return simulateLatency({ org, jobs: mockJobs.filter(isPublic).map(toPublicJob) });
}

// TODO(backend): wire to real endpoint. Public, no sign-in. Null when the job does not exist or is not taking applications.
export async function getPublicJob(
  orgSlug: string,
  jobSlug: string,
): Promise<{ org: OrgPublicProfile; job: PublicJob } | null> {
  const org = orgProfile();
  const job = mockJobs.find((item) => item.slug === jobSlug);
  if (org.slug !== orgSlug || !job || !isPublic(job)) return simulateLatency(null);
  return simulateLatency({ org, job: toPublicJob(job) });
}

// TODO(backend): wire to real endpoint. Public, no sign-in. Uploads the CV (multipart), scans it,
// parses and scores it like any other CV, and adds the applicant to the job's list as "new".
// Rejects with ApplicationsClosedError once the job stops taking applications.
// TODO(spec): do applications count against the company's CV capacity?
export async function submitApplication(orgSlug: string, jobSlug: string, input: ApplicationInput): Promise<void> {
  await simulateLatency(undefined, SUBMIT_MS);
  const job = mockJobs.find((item) => item.slug === jobSlug);
  if (orgProfile().slug !== orgSlug || !job || !isPublic(job)) throw new ApplicationsClosedError();

  const candidate = candidateFromFile(job, null, `app-${Date.now()}`, input.cv.name);
  candidate.cv.fullName = input.fullName.trim();
  candidate.cv.email = input.email.trim();
  candidate.cv.phone = input.phone.trim() || null;
  mockCandidates.push(candidate);
  job.candidateCount += 1;
  for (const plan of Object.values(mockPlans)) plan.cvUsed += 1;
}
