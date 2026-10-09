import type { Skill, SkillRef } from "@/types";

// A small sample of the ~300-skill canonical catalogue.
export const mockSkills: Skill[] = [
  { id: "react", name: { en: "React", ar: "ريأكت" }, aliases: ["React.js", "ReactJS"] },
  { id: "typescript", name: { en: "TypeScript", ar: "تايب سكريبت" }, aliases: ["TS"] },
  { id: "javascript", name: { en: "JavaScript", ar: "جافا سكريبت" }, aliases: ["JS", "ES6"] },
  { id: "nodejs", name: { en: "Node.js", ar: "نود جي إس" }, aliases: ["NodeJS", "Node"] },
  { id: "python", name: { en: "Python", ar: "بايثون" }, aliases: [] },
  { id: "sql", name: { en: "SQL", ar: "إس كيو إل" }, aliases: ["MySQL", "PostgreSQL"] },
  { id: "figma", name: { en: "Figma", ar: "فيجما" }, aliases: [] },
  { id: "git", name: { en: "Git", ar: "جيت" }, aliases: ["GitHub"] },
  { id: "excel", name: { en: "Excel", ar: "إكسل" }, aliases: ["MS Excel", "Microsoft Excel"] },
  { id: "accounting", name: { en: "Accounting", ar: "المحاسبة" }, aliases: ["Bookkeeping"] },
  { id: "financial-reporting", name: { en: "Financial reporting", ar: "التقارير المالية" }, aliases: [] },
  { id: "sales", name: { en: "Sales", ar: "المبيعات" }, aliases: [] },
  { id: "communication", name: { en: "Communication", ar: "التواصل" }, aliases: [] },
  { id: "leadership", name: { en: "Leadership", ar: "القيادة" }, aliases: [] },
  { id: "project-management", name: { en: "Project management", ar: "إدارة المشاريع" }, aliases: ["PMP"] },
];

export function skillRef(id: string): SkillRef {
  const skill = mockSkills.find((item) => item.id === id);
  if (!skill) throw new Error(`Unknown mock skill: ${id}`);
  return { id: skill.id, name: skill.name };
}
