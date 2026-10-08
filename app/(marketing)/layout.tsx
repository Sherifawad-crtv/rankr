import type { ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border-default bg-surface px-4 py-4 lg:px-8">
        <span className="text-lg font-semibold text-text-primary">Rankr</span>
      </header>
      <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-8 lg:px-8 lg:py-12">{children}</main>
    </div>
  );
}
