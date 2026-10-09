import { flags } from "@/lib/flags";
import { mockUsers } from "@/lib/mocks/data";
import type { SessionUser } from "@/types";

/** What we remember about who is using the app. TODO(backend): replaced by the real auth session. */
export interface StoredSession {
  signedIn: boolean;
  user: SessionUser;
}

const STORAGE_KEY = "rankr-session";
const listeners = new Set<() => void>();

/** With sign-in required, a visitor with no stored session starts signed out; otherwise the app opens as the mock recruiter. */
export const DEFAULT_SESSION: StoredSession = { signedIn: !flags.requireSignIn(), user: mockUsers.recruiter };

let cachedRaw: string | null | undefined;
let cached: StoredSession = DEFAULT_SESSION;

function isStoredSession(value: unknown): value is StoredSession {
  if (typeof value !== "object" || value === null) return false;
  const { signedIn, user } = value as Partial<StoredSession>;
  return typeof signedIn === "boolean" && typeof user?.id === "string" && typeof user?.email === "string";
}

/** Returns the same object until the stored text changes, as useSyncExternalStore requires. */
export function readSession(): StoredSession {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked; the default session applies.
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    cached = isStoredSession(parsed) ? parsed : DEFAULT_SESSION;
  } catch {
    cached = DEFAULT_SESSION;
  }
  return cached;
}

export function writeSession(next: StoredSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Not remembering is fine; the change lasts until reload.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
