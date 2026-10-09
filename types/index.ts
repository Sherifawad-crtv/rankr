/**
 * Shared entity types. These are the contract the back-end implements against.
 * Derived from the screen specs; keep them minimal.
 * Data minimization: no gender, age, religion, marital status or photo fields, ever.
 */

export type PlanMode = "solo" | "enterprise";
/** Rankr staff see every company; company admins manage their workspace; recruiters screen CVs. */
export type UserRole = "staff" | "company_admin" | "recruiter";
export type Locale = "en" | "ar";
/** Text that exists in both supported languages. Arabic may be missing. */
export interface LocalizedText {
  en: string;
  ar?: string;
}
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

/** A skill from the canonical catalogue (~300 skills, English and Arabic aliases). */
export interface Skill {
  id: string;
  name: LocalizedText;
  /** Alternative spellings that resolve to this skill, e.g. "ReactJS", "React.js". */
  aliases: string[];
}

export type SkillRef = Pick<Skill, "id" | "name">;

/** Required skills weigh most, then preferred, then nice-to-have. */
export type SkillTier = "required" | "preferred" | "niceToHave";
export const SKILL_TIERS: SkillTier[] = ["required", "preferred", "niceToHave"];

export interface JobSkill {
  skill: SkillRef;
  tier: SkillTier;
}

export type DegreeLevel = "none" | "diploma" | "bachelor" | "master" | "doctorate"; // TODO(spec): degree levels
export const DEGREE_LEVELS: DegreeLevel[] = ["none", "diploma", "bachelor", "master", "doctorate"];

/** A knock-out rule. Candidates who fail stay visible in the "filtered out" group with the reason. */
export type HardFilter =
  | { id: string; kind: "requiredSkills"; skills: SkillRef[] }
  | { id: string; kind: "minExperienceYears"; years: number }
  | { id: string; kind: "minDegree"; level: DegreeLevel }
  | { id: string; kind: "location"; value: string }
  | { id: string; kind: "workAuthorization" }; // TODO(spec): exact work-authorisation wording

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  status: "draft" | "open" | "closed";
  skills: JobSkill[];
  minExperienceYears: number;
  degreeLevel: DegreeLevel;
  hardFilters: HardFilter[];
  weights: ScoreWeights;
  candidateCount: number;
  createdAt: string;
}

export type JobInput = Pick<
  Job,
  | "title"
  | "description"
  | "location"
  | "skills"
  | "minExperienceYears"
  | "degreeLevel"
  | "hardFilters"
  | "weights"
>;

export type LanguageLevel = "basic" | "conversational" | "fluent" | "native";

/** A skill as read from the CV. `skillId` is null when it could not be mapped to the catalogue. */
export interface ParsedSkill {
  skillId: string | null;
  label: string;
}

export interface ParsedCV {
  /** English (transliterated) name. */
  fullName: string;
  fullNameAr: string | null;
  email: string;
  phone: string | null;
  skills: ParsedSkill[];
  experienceYears: number;
  roles: Array<{ title: string; company: string; period: string }>;
  education: Array<{ degree: DegreeLevel; field: string; institution: string }>;
  languages: Array<{ language: string; level: LanguageLevel }>;
  /** Parse confidence, 0-1. */
  confidence: number;
}

/** Pipeline stage a recruiter moves a candidate through. Interview scheduling is out of scope. */
export type CandidateStage = "new" | "shortlisted" | "rejected" | "hired";

export interface Candidate {
  id: string;
  jobId: string;
  runId: string;
  cv: ParsedCV;
  breakdown: ScoreBreakdown;
  /** Why this candidate scored as they did, in one or two plain sentences. */
  rationale: string;
  matchedSkills: SkillRef[];
  missingRequiredSkills: SkillRef[];
  extraSkills: SkillRef[];
  stage: CandidateStage;
  lowConfidence: boolean;
  /** The CV was a scanned PDF and went through OCR. */
  ocrUsed: boolean;
  /** Set when this CV matches one already processed (SHA-256); the earlier result is reused. */
  duplicateOf: string | null;
  /** Set when a hard filter knocked the candidate out; they stay visible with the reason. */
  filteredOut: { reason: string } | null;
}

export type ProcessingStatus = "pending" | "processing" | "done" | "failed";

/** The steps a CV passes through while its status is "processing". */
export type ProcessingStep = "detecting" | "reading" | "parsing" | "scoring";

export const PROCESSING_STEPS: ProcessingStep[] = ["detecting", "reading", "parsing", "scoring"];

export interface UploadedCV {
  id: string;
  jobId: string;
  fileName: string;
  status: ProcessingStatus;
  /** Set while status is "processing", otherwise null. */
  step: ProcessingStep | null;
  /** Identical to a CV already processed; the earlier result is reused. */
  isDuplicate: boolean;
  /** Plain-language reason, set when status is "failed". */
  error: string | null;
  /** Scanned PDF read with OCR. Known once the file has been read. */
  ocrUsed: boolean;
  /** Parsed with low confidence. Known once the file has been read. */
  lowConfidence: boolean;
}

/** Where an upload is while the files travel to Rankr. */
export interface UploadProgress {
  phase: "uploading" | "scanning";
  done: number;
  total: number;
}

/** Hourly upload allowance per user. TODO(spec): confirm an "upload" means one batch, not one file. */
export interface UploadQuota {
  limit: number;
  used: number;
  /** Minutes until the allowance resets. */
  resetsInMinutes: number;
}

/** One batch of CVs uploaded together for a job (up to 500). */
export interface ScreeningRun {
  id: string;
  jobId: string;
  jobTitle: string;
  createdAt: string;
  status: "processing" | "completed";
  total: number;
  scored: number;
  failed: number;
  duplicates: number;
}

/** The CVs submitted together for one job, with their processing progress. */
export interface ProcessingBatch {
  jobId: string;
  runId: string;
  files: UploadedCV[];
  /** Seconds until every file is settled, or null when there is no estimate or the run is finished. */
  etaSeconds: number | null;
}

/** A short-lived, signed link to the original CV file. Never a public URL. */
export interface CvLink {
  url: string;
  expiresInSeconds: number;
}

/** Candidate-facing view: stage only, never scores or rankings. TODO(spec): candidate-facing stage labels. */
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

export interface DashboardJob extends Job {
  shortlistedCount: number;
}

/** A strong candidate worth a look first, across the recruiter's open jobs. */
export interface TopMatch {
  candidateId: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  /** Match % at the job's own weights, already adjusted for parse confidence. */
  matchPercent: number;
  lowConfidence: boolean;
}

export interface DashboardSummary {
  plan: Plan;
  jobs: DashboardJob[];
  /** Most recent first. */
  recentRuns: ScreeningRun[];
  topMatches: TopMatch[];
  totalCandidates: number;
  shortlistedCount: number;
  /** Low-confidence candidates a person should check by hand. */
  needsReviewCount: number;
}

/** Per-organisation look for the white-label candidate portal. */
export interface OrgBranding {
  name: string;
  /** Logo image URL, or null to show the name as text. */
  logoUrl: string | null;
  /** Brand colour as a 6-digit hex, e.g. "#2563EB". */
  primaryColor: string;
}
