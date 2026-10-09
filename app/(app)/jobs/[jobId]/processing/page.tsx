import { PageFallback } from "@/components/ui";
import { Suspense } from "react";
import { ProcessingView } from "@/components/upload/processing-view";

async function ProcessingContent({
  params,
}: {
  params: PageProps<"/jobs/[jobId]/processing">["params"];
}) {
  const { jobId } = await params;
  return <ProcessingView jobId={jobId} />;
}

export default function ProcessingPage(props: PageProps<"/jobs/[jobId]/processing">) {
  return (
    <Suspense fallback={<PageFallback />}>
      <ProcessingContent params={props.params} />
    </Suspense>
  );
}
