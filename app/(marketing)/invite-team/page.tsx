import { redirect } from "next/navigation";
import { Suspense } from "react";
import { NoPlanNotice } from "@/components/entry/no-plan-notice";
import { InviteTeamView } from "@/components/entry/invite-team-view";
import { PageFallback } from "@/components/ui";
import { parsePlanSelection, planQuery } from "@/lib/entry-flow";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function InviteTeamContent({ searchParams }: { searchParams: SearchParams }) {
  const selection = parsePlanSelection(await searchParams);
  if (!selection) return <NoPlanNotice messageKey="plans.noPlanTeam" />;
  // Teams are an Enterprise feature; Solo accounts go straight on.
  if (selection.plan === "solo") redirect(`/welcome?${planQuery(selection)}`);
  return <InviteTeamView selection={selection} />;
}

export default function InviteTeamPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <InviteTeamContent searchParams={searchParams} />
    </Suspense>
  );
}
