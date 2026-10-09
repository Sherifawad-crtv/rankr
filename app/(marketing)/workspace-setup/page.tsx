import { PageFallback } from "@/components/ui";
import { Suspense } from "react";
import { NoPlanNotice } from "@/components/entry/no-plan-notice";
import { WorkspaceSetupView } from "@/components/entry/workspace-setup-view";
import { parsePlanSelection } from "@/lib/entry-flow";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function WorkspaceSetupContent({ searchParams }: { searchParams: SearchParams }) {
  const selection = parsePlanSelection(await searchParams);

  if (!selection) {
    return <NoPlanNotice messageKey="plans.noPlanWorkspace" />;
  }

  return <WorkspaceSetupView selection={selection} />;
}

export default function WorkspaceSetupPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <WorkspaceSetupContent searchParams={searchParams} />
    </Suspense>
  );
}
