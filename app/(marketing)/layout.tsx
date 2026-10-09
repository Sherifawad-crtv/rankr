import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { FunnelHeader } from "@/components/entry/funnel-header";
import { flags } from "@/lib/flags";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  // The sign-up funnel is hidden until it is ready. Set SHOW_ENTRY_FLOW=true to expose it (see lib/flags.ts).
  if (!flags.entryFlow()) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<div className="h-16 border-b border-border-default bg-surface" />}>
        <FunnelHeader />
      </Suspense>
      <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-8 lg:px-8 lg:py-12">{children}</main>
    </div>
  );
}
