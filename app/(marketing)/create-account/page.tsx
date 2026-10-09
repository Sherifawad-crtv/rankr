import { PageFallback } from "@/components/ui";
import { Suspense } from "react";
import { NoPlanNotice } from "@/components/entry/no-plan-notice";
import { CreateAccountForm } from "@/components/entry/create-account-form";
import { parsePlanSelection } from "@/lib/entry-flow";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function CreateAccountContent({ searchParams }: { searchParams: SearchParams }) {
  const selection = parsePlanSelection(await searchParams);

  if (!selection) {
    return <NoPlanNotice messageKey="plans.noPlanAccount" />;
  }

  return <CreateAccountForm selection={selection} />;
}

export default function CreateAccountPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <CreateAccountContent searchParams={searchParams} />
    </Suspense>
  );
}
