import { Suspense } from "react";
import { UploadView } from "@/components/upload/upload-view";

async function UploadContent({ params }: { params: PageProps<"/jobs/[jobId]/upload">["params"] }) {
  const { jobId } = await params;
  return <UploadView jobId={jobId} />;
}

export default function UploadPage(props: PageProps<"/jobs/[jobId]/upload">) {
  return (
    <Suspense fallback={<p role="status" className="py-12 text-center text-text-secondary">Loading…</p>}>
      <UploadContent params={props.params} />
    </Suspense>
  );
}
