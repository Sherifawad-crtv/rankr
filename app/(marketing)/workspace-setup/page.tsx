import Link from "next/link";
import { Suspense } from "react";
import { Card } from "@/components/ui";
import { WorkspaceSetupView } from "@/components/entry/workspace-setup-view";
import { parsePlanSelection } from "@/lib/entry-flow";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function WorkspaceSetupContent({ searchParams }: { searchParams: SearchParams }) {
  const selection = parsePlanSelection(await searchParams);

  if (!selection) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <p className="text-base text-text-primary">Choose a plan to set up your workspace.</p>
        <Link href="/plans" className="text-base font-medium text-primary hover:underline">
          View plans
        </Link>
      </Card>
    );
  }

  return <WorkspaceSetupView selection={selection} />;
}

export default function WorkspaceSetupPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<p role="status" className="text-center text-text-secondary">Loading…</p>}>
      <WorkspaceSetupContent searchParams={searchParams} />
    </Suspense>
  );
}
