import type { ReactNode } from "react";

/** Re-mounts on every navigation, so each screen eases in. */
export default function MarketingTemplate({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
