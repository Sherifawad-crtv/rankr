import Link from "next/link";
import { Suspense } from "react";
import { Card } from "@/components/ui";
import { VerifyEmailView } from "@/components/entry/verify-email-view";
import { parseEmail, parsePlanSelection } from "@/lib/entry-flow";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function VerifyEmailContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const selection = parsePlanSelection(params);
  const email = parseEmail(params);

  if (!selection || !email) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <p className="text-base text-text-primary">Start by choosing a plan and creating an account.</p>
        <Link href="/plans" className="text-base font-medium text-primary hover:underline">
          View plans
        </Link>
      </Card>
    );
  }

  return <VerifyEmailView email={email} selection={selection} />;
}

export default function VerifyEmailPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<p role="status" className="text-center text-text-secondary">Loading…</p>}>
      <VerifyEmailContent searchParams={searchParams} />
    </Suspense>
  );
}
