import { Suspense } from "react";
import { JobWizardLoader } from "@/components/jobs/wizard/job-wizard-loader";

async function EditContent({ params }: { params: PageProps<"/jobs/[jobId]/edit">["params"] }) {
  const { jobId } = await params;
  return <JobWizardLoader jobId={jobId} />;
}

export default function EditJobPage(props: PageProps<"/jobs/[jobId]/edit">) {
  return (
    <Suspense fallback={<p role="status" className="py-12 text-center text-text-secondary">Loading…</p>}>
      <EditContent params={props.params} />
    </Suspense>
  );
}
