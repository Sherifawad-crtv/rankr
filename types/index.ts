/**
 * Shared entity types. These are the contract the back-end implements against.
 * Derived from the screen specs; keep them minimal.
 * Data minimization: no gender, age, religion, marital status or photo fields, ever.
 */

export type PlanMode = "solo" | "enterprise";
export type UserRole = "admin" | "recruiter";
export type BillingCycle = "monthly" | "yearly";

/** Enterprise CV-capacity tiers per cycle (draggable 4-stop control). */
export const ENTERPRISE_CV_TIERS = [100, 500, 1000, 1500] as const;
export type EnterpriseCvTier = (typeof ENTERPRISE_CV_TIERS)[number];

export interface Plan {
  mode: PlanMode;
  billingCycle: BillingCycle;
  /** CVs per cycle, shared across all members. */
  cvCapacity: number | null; // TODO(spec): Solo capacity is OPEN
  cvUsed: number;
  /** Price per month in the display currency. */
  pricePerMonth: number | null; // TODO(spec): prices are OPEN
  /** Yearly discount percent. */
  yearlyDiscountPercent: number | null; // TODO(spec): discount is OPEN
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface SessionUser extends Member {
  planMode: PlanMode;
}

export type ScoreDimension = "skills" | "experience" | "education" | "profileQuality";

export const SCORE_DIMENSIONS: ScoreDimension[] = [
  "skills",
  "experience",
  "education",
  "profileQuality",
];

/** Weights as whole percentages; must total 100. */
export type ScoreWeights = Record<ScoreDimension, number>;

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  skills: 40,
  experience: 25,
  education: 15,
  profileQuality: 20,
};

/** Per-dimension scores, 0-100. */
export type ScoreBreakdown = Record<ScoreDimension, number>;

export interface HardFilter {
  id: string;
  label: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  status: "draft" | "open" | "closed";
  hardFilters: HardFilter[];
  weights: ScoreWeights;
  candidateCount: number;
  createdAt: string;
}

export interface JobInput {
  title: string;
  description: string;
  location: string;
  hardFilters: HardFilter[];
  weights: ScoreWeights;
}

export interface ParsedCV {
  fullName: string;
  email: string;
  phone: string | null;
  skills: string[];
  experienceYears: number;
  education: string[];
  /** Parse confidence, 0-1. */
  confidence: number;
}

export type CandidateStage =
  | "applied"
  | "reviewing"
  | "shortlisted"
  | "interview"
  | "offer"
  | "closed";

export interface Candidate {
  id: string;
  jobId: string;
  cv: ParsedCV;
  breakdown: ScoreBreakdown;
  stage: CandidateStage;
  lowConfidence: boolean;
  /** Set when a hard filter knocked the candidate out; they stay visible with the reason. */
  filteredOut: { reason: string } | null;
}

export type ProcessingStatus = "queued" | "processing" | "done" | "failed";

export interface UploadedCV {
  id: string;
  jobId: string;
  fileName: string;
  status: ProcessingStatus;
}

/** The CVs submitted together for one job, with their processing progress. */
export interface ProcessingBatch {
  jobId: string;
  files: UploadedCV[];
}

/** Candidate-facing view: stage only, never scores or rankings. */
export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  stage: CandidateStage;
  submittedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderName: string;
  body: string;
  sentAt: string;
}

/** Public pricing shown on the Plans screen. */
export interface PricingCatalog {
  /** TODO(spec): currency is OPEN. */
  currency: string | null;
  solo: {
    cvCapacity: number | null; // TODO(spec): Solo capacity is OPEN
    pricePerMonth: number | null; // TODO(spec): prices are OPEN
  };
  /** Price per month for each Enterprise CV tier. */
  enterpriseTiers: Record<EnterpriseCvTier, number | null>; // TODO(spec): tier prices are OPEN
  /** Percent off when billed yearly. */
  yearlyDiscountPercent: number | null; // TODO(spec): discount is OPEN
}

/** The plan chosen on the Plans screen, carried through the entry funnel. */
export interface PlanSelection {
  plan: PlanMode;
  /** Enterprise only. */
  tier: EnterpriseCvTier | null;
  cycle: BillingCycle;
}

export interface CreateAccountInput {
  fullName: string;
  email: string;
  password: string;
  plan: PlanSelection;
}

export const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"] as const; // TODO(spec): size bands
export type CompanySize = (typeof COMPANY_SIZES)[number];

export interface AccountProfile {
  fullName: string;
  email: string;
}

export interface WorkspaceInput {
  companyName: string;
  companySize: CompanySize;
  fullName: string;
  jobTitle: string;
  plan: PlanSelection;
}

export interface DashboardCandidate {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  stage: CandidateStage;
  lowConfidence: boolean;
}

export interface DashboardSummary {
  plan: Plan;
  jobs: Job[];
  /** Most recently added first. */
  recentCandidates: DashboardCandidate[];
  totalCandidates: number;
  /** Low-confidence candidates a person should check by hand. */
  needsReviewCount: number;
  filteredOutCount: number;
}
