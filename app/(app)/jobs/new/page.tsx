import { Suspense } from "react";
import { JobWizardLoader } from "@/components/jobs/wizard/job-wizard-loader";
import { PageFallback } from "@/components/ui";

export default function NewJobPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <JobWizardLoader />
    </Suspense>
  );
}
