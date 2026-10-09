import {
  DEFAULT_SCORE_WEIGHTS,
  type Candidate,
  type Job,
  type Message,
  type Plan,
  type PricingCatalog,
  type SessionUser,
} from "@/types";

export const mockUsers: Record<"admin" | "recruiter", SessionUser> = {
  admin: {
    id: "u1",
    name: "Mock Admin",
    email: "admin@example.com",
    role: "admin",
    planMode: "enterprise",
  },
  recruiter: {
    id: "u2",
    name: "Mock Recruiter",
    email: "recruiter@example.com",
    role: "recruiter",
    planMode: "enterprise",
  },
};

export const mockPlans: Record<"solo" | "enterprise", Plan> = {
  solo: {
    mode: "solo",
    billingCycle: "monthly",
    cvCapacity: null, // TODO(spec): Solo capacity is OPEN
    cvUsed: 0,
    pricePerMonth: null, // TODO(spec): prices are OPEN
    yearlyDiscountPercent: null, // TODO(spec): discount is OPEN
  },
  enterprise: {
    mode: "enterprise",
    billingCycle: "monthly",
    cvCapacity: 500,
    cvUsed: 120,
    pricePerMonth: null, // TODO(spec): prices are OPEN
    yearlyDiscountPercent: null, // TODO(spec): discount is OPEN
  },
};

export const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "Sample Job",
    description: "Placeholder job description.",
    location: "Cairo",
    status: "open",
    hardFilters: [{ id: "hf-1", label: "Minimum 2 years experience" }],
    weights: DEFAULT_SCORE_WEIGHTS,
    candidateCount: 3,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

export const mockCandidates: Candidate[] = [
  {
    id: "cand-1",
    jobId: "job-1",
    cv: {
      fullName: "Candidate One",
      email: "one@example.com",
      phone: null,
      skills: ["Skill A", "Skill B"],
      experienceYears: 5,
      education: ["Degree A"],
      confidence: 0.92,
    },
    breakdown: { skills: 85, experience: 70, education: 60, profileQuality: 90 },
    stage: "shortlisted",
    lowConfidence: false,
    filteredOut: null,
  },
  {
    id: "cand-2",
    jobId: "job-1",
    cv: {
      fullName: "Candidate Two",
      email: "two@example.com",
      phone: null,
      skills: ["Skill A"],
      experienceYears: 3,
      education: ["Degree B"],
      confidence: 0.41,
    },
    breakdown: { skills: 60, experience: 55, education: 80, profileQuality: 50 },
    stage: "new",
    lowConfidence: true,
    filteredOut: null,
  },
  {
    id: "cand-3",
    jobId: "job-1",
    cv: {
      fullName: "Candidate Three",
      email: "three@example.com",
      phone: null,
      skills: [],
      experienceYears: 1,
      education: [],
      confidence: 0.88,
    },
    breakdown: { skills: 30, experience: 20, education: 40, profileQuality: 60 },
    stage: "new",
    lowConfidence: false,
    filteredOut: { reason: "Minimum 2 years experience" },
  },
];

export const mockMessages: Message[] = [];

export const mockPricing: PricingCatalog = {
  currency: null,
  solo: { cvCapacity: null, pricePerMonth: null },
  enterpriseTiers: { 100: null, 500: null, 1000: null, 1500: null },
  yearlyDiscountPercent: null,
};
