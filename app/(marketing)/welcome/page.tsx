import { Suspense } from "react";
import { WelcomeView } from "@/components/entry/welcome-view";
import { PageFallback } from "@/components/ui";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function WelcomeContent({ searchParams }: { searchParams: SearchParams }) {
  const { invited } = await searchParams;
  const count = Number(Array.isArray(invited) ? invited[0] : invited);
  return <WelcomeView invited={Number.isInteger(count) && count > 0 ? count : 0} />;
}

export default function WelcomePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <WelcomeContent searchParams={searchParams} />
    </Suspense>
  );
}
