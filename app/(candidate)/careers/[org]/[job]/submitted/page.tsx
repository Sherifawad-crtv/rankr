import { Suspense } from "react";
import { SubmittedView } from "@/components/careers/submitted-view";
import { PageFallback } from "@/components/ui";

async function Content({ params }: { params: PageProps<"/careers/[org]/[job]/submitted">["params"] }) {
  const { org, job } = await params;
  return <SubmittedView orgSlug={org} jobSlug={job} />;
}

export default function SubmittedPage(props: PageProps<"/careers/[org]/[job]/submitted">) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Content params={props.params} />
    </Suspense>
  );
}
