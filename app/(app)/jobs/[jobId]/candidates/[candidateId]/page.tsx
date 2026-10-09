import { Suspense } from "react";
import { CandidateDetailView } from "@/components/candidate/candidate-detail-view";

async function CandidateContent({
  params,
}: {
  params: PageProps<"/jobs/[jobId]/candidates/[candidateId]">["params"];
}) {
  const { jobId, candidateId } = await params;
  return <CandidateDetailView jobId={jobId} candidateId={candidateId} />;
}

export default function CandidatePage(props: PageProps<"/jobs/[jobId]/candidates/[candidateId]">) {
  return (
    <Suspense fallback={<p role="status" className="py-12 text-center text-text-secondary">Loading…</p>}>
      <CandidateContent params={props.params} />
    </Suspense>
  );
}
