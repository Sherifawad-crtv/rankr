import { PageFallback } from "@/components/ui";
import { Suspense } from "react";
import { RankedView } from "@/components/ranking/ranked-view";

async function CandidatesContent({
  params,
}: {
  params: PageProps<"/jobs/[jobId]/candidates">["params"];
}) {
  const { jobId } = await params;
  return <RankedView jobId={jobId} />;
}

export default function CandidatesPage(props: PageProps<"/jobs/[jobId]/candidates">) {
  return (
    <Suspense fallback={<PageFallback />}>
      <CandidatesContent params={props.params} />
    </Suspense>
  );
}
