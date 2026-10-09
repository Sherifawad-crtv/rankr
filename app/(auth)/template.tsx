import type { ReactNode } from "react";

export default function AuthTemplate({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
