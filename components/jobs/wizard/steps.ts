import type { MessageKey } from "@/lib/i18n";

export const WIZARD_STEPS = ["basics", "requirements", "filters", "weights", "review"] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

export const STEP_LABEL_KEYS: Record<WizardStep, MessageKey> = {
  basics: "job.wizard.step.basics",
  requirements: "job.wizard.step.requirements",
  filters: "job.wizard.step.filters",
  weights: "job.wizard.step.weights",
  review: "job.wizard.step.review",
};

export interface StepErrors {
  title?: string;
  location?: string;
  requiredSkill?: string;
  filterLocation?: string;
  form?: string;
}
