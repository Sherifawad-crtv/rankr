import type { ReactNode } from "react";

/** Public pages for applicants: no sign-in, no Rankr app shell. */
export default function CandidateLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
