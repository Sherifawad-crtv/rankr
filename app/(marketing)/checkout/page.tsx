import Link from "next/link";
import { Suspense } from "react";
import { Card } from "@/components/ui";
import { CheckoutView } from "@/components/entry/checkout-view";
import { parsePlanSelection } from "@/lib/entry-flow";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function CheckoutContent({ searchParams }: { searchParams: SearchParams }) {
  const selection = parsePlanSelection(await searchParams);

  if (!selection) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <p className="text-base text-text-primary">Choose a plan to check out.</p>
        <Link href="/plans" className="text-base font-medium text-primary hover:underline">
          View plans
        </Link>
      </Card>
    );
  }

  return <CheckoutView selection={selection} />;
}

export default function CheckoutPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<p role="status" className="text-center text-text-secondary">Loading…</p>}>
      <CheckoutContent searchParams={searchParams} />
    </Suspense>
  );
}
