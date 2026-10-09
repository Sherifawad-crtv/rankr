"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { mockUsers } from "@/lib/mocks/data";
import type { PlanMode, SessionUser, UserRole } from "@/types";
import { DEFAULT_SESSION, readSession, subscribeSession, writeSession } from "./session-store";

interface SessionValue {
  user: SessionUser;
  signedIn: boolean;
  /** Called after a successful sign-in with the account the back-end returned. */
  signIn: (user: SessionUser) => void;
  signOut: () => void;
  /** Dev switchers: act as another role or plan. */
  setRole: (role: UserRole) => void;
  setPlanMode: (mode: PlanMode) => void;
}

const SessionContext = createContext<SessionValue | null>(null);

// TODO(backend): replace the mock session with the real auth provider.
export function SessionProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(subscribeSession, readSession, () => DEFAULT_SESSION);

  const signIn = useCallback((user: SessionUser) => writeSession({ signedIn: true, user }), []);
  const signOut = useCallback(() => writeSession({ signedIn: false, user: readSession().user }), []);
  const setRole = useCallback(
    (role: UserRole) => {
      const current = readSession();
      writeSession({
        signedIn: current.signedIn,
        user: { ...mockUsers[role], planMode: current.user.planMode },
      });
    },
    [],
  );
  const setPlanMode = useCallback((planMode: PlanMode) => {
    const current = readSession();
    writeSession({ signedIn: current.signedIn, user: { ...current.user, planMode } });
  }, []);

  const value = useMemo<SessionValue>(
    () => ({ user: stored.user, signedIn: stored.signedIn, signIn, signOut, setRole, setPlanMode }),
    [stored, signIn, signOut, setRole, setPlanMode],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used within SessionProvider");
  return value;
}
