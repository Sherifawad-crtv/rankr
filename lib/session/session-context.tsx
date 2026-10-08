"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { mockUsers } from "@/lib/mocks/data";
import type { PlanMode, SessionUser, UserRole } from "@/types";

interface SessionValue {
  user: SessionUser;
  setRole: (role: UserRole) => void;
  setPlanMode: (mode: PlanMode) => void;
}

const SessionContext = createContext<SessionValue | null>(null);

// TODO(backend): replace mock session with real auth provider
export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("recruiter");
  const [planMode, setPlanMode] = useState<PlanMode>("enterprise");

  const value = useMemo<SessionValue>(
    () => ({ user: { ...mockUsers[role], planMode }, setRole, setPlanMode }),
    [role, planMode],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used within SessionProvider");
  return value;
}
