import { Suspense } from "react";
import { ApplyView } from "@/components/careers/apply-view";
import { PageFallback } from "@/components/ui";

async function Content({ params }: { params: PageProps<"/careers/[org]/[job]/apply">["params"] }) {
  const { org, job } = await params;
  return <ApplyView orgSlug={org} jobSlug={job} />;
}

export default function ApplyPage(props: PageProps<"/careers/[org]/[job]/apply">) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Content params={props.params} />
    </Suspense>
  );
}
