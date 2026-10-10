import { Suspense } from "react";
import { ApplicationsView } from "@/components/applications/applications-view";
import { PageFallback } from "@/components/ui";

async function Content({ params }: { params: PageProps<"/jobs/[jobId]/applications">["params"] }) {
  const { jobId } = await params;
  return <ApplicationsView jobId={jobId} />;
}

export default function ApplicationsPage(props: PageProps<"/jobs/[jobId]/applications">) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Content params={props.params} />
    </Suspense>
  );
}
