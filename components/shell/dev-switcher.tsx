"use client";

import { useSession } from "@/lib/session";
import type { PlanMode, UserRole } from "@/types";

const selectClass =
  "h-8 rounded-md border border-border-default bg-surface px-2 text-sm text-text-primary focus-visible:outline-2 focus-visible:outline-border-focus";

/** Dev-only control for the mock session. Not rendered in production builds. */
export function DevSwitcher() {
  const { user, setRole, setPlanMode } = useSession();

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="flex items-center gap-2" aria-label="Dev session switcher" role="group">
      <label className="flex items-center gap-1 text-sm text-text-secondary">
        Role
        <select
          className={selectClass}
          value={user.role}
          onChange={(event) => setRole(event.target.value as UserRole)}
        >
          <option value="recruiter">Recruiter</option>
          <option value="company_admin">Company admin</option>
          <option value="staff">Rankr staff</option>
        </select>
      </label>
      <label className="flex items-center gap-1 text-sm text-text-secondary">
        Plan
        <select
          className={selectClass}
          value={user.planMode}
          onChange={(event) => setPlanMode(event.target.value as PlanMode)}
        >
          <option value="enterprise">Enterprise</option>
          <option value="solo">Solo</option>
        </select>
      </label>
    </div>
  );
}
