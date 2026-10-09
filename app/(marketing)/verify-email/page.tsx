import { PageFallback } from "@/components/ui";
import { Suspense } from "react";
import { NoPlanNotice } from "@/components/entry/no-plan-notice";
import { VerifyEmailView } from "@/components/entry/verify-email-view";
import { parseEmail, parsePlanSelection } from "@/lib/entry-flow";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function VerifyEmailContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const selection = parsePlanSelection(params);
  const email = parseEmail(params);

  if (!selection || !email) {
    return <NoPlanNotice messageKey="plans.noPlanVerify" />;
  }

  return <VerifyEmailView email={email} selection={selection} />;
}

export default function VerifyEmailPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <VerifyEmailContent searchParams={searchParams} />
    </Suspense>
  );
}
