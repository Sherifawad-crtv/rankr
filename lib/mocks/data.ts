import {
  DEFAULT_SCORE_WEIGHTS,
  type Candidate,
  type Job,
  type Plan,
  type PricingCatalog,
  type ScreeningRun,
  type SessionUser,
  type UserRole,
} from "@/types";
import { skillRef } from "./skills";

export const mockUsers: Record<UserRole, SessionUser> = {
  staff: {
    id: "u0",
    name: "Rankr Staff",
    email: "staff@rankr.example",
    role: "staff",
    planMode: "enterprise",
  },
  company_admin: {
    id: "u1",
    name: "Mock Admin",
    email: "admin@example.com",
    role: "company_admin",
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
    title: "Senior Frontend Developer",
    description: "Build and maintain the customer-facing web app.",
    location: "Cairo",
    status: "open",
    skills: [
      { skill: skillRef("react"), tier: "required" },
      { skill: skillRef("typescript"), tier: "required" },
      { skill: skillRef("nodejs"), tier: "preferred" },
      { skill: skillRef("figma"), tier: "niceToHave" },
    ],
    minExperienceYears: 3,
    degreeLevel: "bachelor",
    hardFilters: [{ id: "hf-1", kind: "minExperienceYears", years: 2 }],
    weights: DEFAULT_SCORE_WEIGHTS,
    candidateCount: 3,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "job-2",
    title: "Accountant",
    description: "Own monthly close and financial reporting.",
    location: "Alexandria",
    status: "open",
    skills: [
      { skill: skillRef("accounting"), tier: "required" },
      { skill: skillRef("excel"), tier: "required" },
      { skill: skillRef("financial-reporting"), tier: "preferred" },
    ],
    minExperienceYears: 2,
    degreeLevel: "bachelor",
    hardFilters: [{ id: "hf-2", kind: "requiredSkills", skills: [skillRef("accounting")] }],
    weights: DEFAULT_SCORE_WEIGHTS,
    candidateCount: 0,
    createdAt: "2026-01-05T00:00:00.000Z",
  },
];

export const mockCandidates: Candidate[] = [
  {
    id: "cand-1",
    jobId: "job-1",
    runId: "run-1",
    cv: {
      fullName: "Ahmed Hassan",
      fullNameAr: "أحمد حسن",
      email: "ahmed.hassan@example.com",
      phone: null,
      skills: [
        { skillId: "react", label: "React" },
        { skillId: "typescript", label: "TypeScript" },
        { skillId: "nodejs", label: "Node.js" },
      ],
      experienceYears: 5,
      roles: [{ title: "Frontend Developer", company: "Example Co", period: "2021 - 2026" }],
      education: [{ degree: "bachelor", field: "Computer Science", institution: "Cairo University" }],
      languages: [
        { language: "Arabic", level: "native" },
        { language: "English", level: "fluent" },
      ],
      confidence: 0.92,
    },
    breakdown: { skills: 85, experience: 70, education: 60, profileQuality: 90 },
    rationale: "Matches both required skills and has 5 years of experience, above the 3 you asked for.",
    matchedSkills: [skillRef("react"), skillRef("typescript"), skillRef("nodejs")],
    missingRequiredSkills: [],
    extraSkills: [],
    stage: "shortlisted",
    lowConfidence: false,
    ocrUsed: false,
    duplicateOf: null,
    filteredOut: null,
  },
  {
    id: "cand-2",
    jobId: "job-1",
    runId: "run-1",
    cv: {
      fullName: "Sara Ali",
      fullNameAr: "سارة علي",
      email: "sara.ali@example.com",
      phone: null,
      skills: [
        { skillId: "react", label: "ReactJS" },
        { skillId: null, label: "Web components" },
      ],
      experienceYears: 3,
      roles: [{ title: "Web Developer", company: "Sample Studio", period: "2023 - 2026" }],
      education: [{ degree: "diploma", field: "Information Systems", institution: "Alexandria Institute" }],
      languages: [{ language: "Arabic", level: "native" }],
      confidence: 0.41,
    },
    breakdown: { skills: 60, experience: 55, education: 80, profileQuality: 50 },
    rationale: "Matches React but not TypeScript. The CV was scanned and parsed with low confidence.",
    matchedSkills: [skillRef("react")],
    missingRequiredSkills: [skillRef("typescript")],
    extraSkills: [],
    stage: "new",
    lowConfidence: true,
    ocrUsed: true,
    duplicateOf: null,
    filteredOut: null,
  },
  {
    id: "cand-3",
    jobId: "job-1",
    runId: "run-1",
    cv: {
      fullName: "Omar Khaled",
      fullNameAr: null,
      email: "omar.khaled@example.com",
      phone: null,
      skills: [],
      experienceYears: 1,
      roles: [],
      education: [],
      languages: [{ language: "English", level: "conversational" }],
      confidence: 0.88,
    },
    breakdown: { skills: 30, experience: 20, education: 40, profileQuality: 60 },
    rationale: "Only 1 year of experience and none of the required skills were found.",
    matchedSkills: [],
    missingRequiredSkills: [skillRef("react"), skillRef("typescript")],
    extraSkills: [],
    stage: "new",
    lowConfidence: false,
    ocrUsed: false,
    duplicateOf: null,
    filteredOut: { reason: "Minimum 2 years of experience" },
  },
];

export const mockRuns: ScreeningRun[] = [
  {
    id: "run-1",
    jobId: "job-1",
    jobTitle: "Senior Frontend Developer",
    createdAt: "2026-01-02T09:00:00.000Z",
    status: "completed",
    total: 3,
    scored: 3,
    failed: 0,
    duplicates: 0,
  },
];


export const mockPricing: PricingCatalog = {
  currency: null,
  solo: { cvCapacity: null, pricePerMonth: null },
  enterpriseTiers: { 100: null, 500: null, 1000: null, 1500: null },
  yearlyDiscountPercent: null,
};
