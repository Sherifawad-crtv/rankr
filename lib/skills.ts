import type { SkillRef } from "@/types";

const CUSTOM_PREFIX = "custom:";

/** A skill typed in by the recruiter that is not in the catalogue yet. It is flagged for review. */
export function customSkill(text: string): SkillRef {
  const name = text.trim();
  return { id: `${CUSTOM_PREFIX}${name.toLowerCase().replace(/\s+/g, "-")}`, name: { en: name } };
}

export function isCustomSkill(id: string): boolean {
  return id.startsWith(CUSTOM_PREFIX);
}
