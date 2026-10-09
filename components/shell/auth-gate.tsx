"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { flags } from "@/lib/flags";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useSession } from "@/lib/session";

/**
 * Keeps signed-out visitors out of the app when NEXT_PUBLIC_REQUIRE_SIGN_IN is on, sending them to
 * sign-in and back to where they were. With the flag off (the default) it does nothing, so the app
 * can be reviewed without signing in. TODO(backend): enforce this on the server with the real session.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { signedIn } = useSession();
  const hydrated = useHydrated();
  const router = useRouter();
  const required = flags.requireSignIn();
  const blocked = required && hydrated && !signedIn;

  useEffect(() => {
    if (blocked) {
      router.replace(`/sign-in?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  }, [blocked, router]);

  if (required && (!hydrated || !signedIn)) return null;
  return children;
}
