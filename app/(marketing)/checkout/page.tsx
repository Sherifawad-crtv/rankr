import { PageFallback } from "@/components/ui";
import { Suspense } from "react";
import { NoPlanNotice } from "@/components/entry/no-plan-notice";
import { CheckoutView } from "@/components/entry/checkout-view";
import { parsePlanSelection } from "@/lib/entry-flow";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function CheckoutContent({ searchParams }: { searchParams: SearchParams }) {
  const selection = parsePlanSelection(await searchParams);

  if (!selection) {
    return <NoPlanNotice messageKey="plans.noPlanCheckout" />;
  }

  return <CheckoutView selection={selection} />;
}

export default function CheckoutPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <CheckoutContent searchParams={searchParams} />
    </Suspense>
  );
}
