import Link from "next/link";
import type { PlanSelection } from "@/types";

export function PlanSummary({ selection }: { selection: PlanSelection }) {
  const name = selection.plan === "solo" ? "Solo" : "Enterprise";
  const detail = [
    selection.tier !== null ? `${selection.tier} CVs per cycle` : null,
    selection.cycle === "monthly" ? "billed monthly" : "billed annually",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex items-start justify-between gap-4 rounded-md bg-subtle p-4">
      <div>
        <p className="text-base font-medium text-text-primary">{name} plan</p>
        <p className="text-sm text-text-secondary">{detail}</p>
      </div>
      <Link href="/plans" className="text-sm font-medium text-primary hover:underline">
        Change
      </Link>
    </div>
  );
}
