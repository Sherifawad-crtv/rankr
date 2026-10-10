import { Suspense } from "react";
import { PublicJobView } from "@/components/careers/public-job-view";
import { PageFallback } from "@/components/ui";

async function Content({ params }: { params: PageProps<"/careers/[org]/[job]">["params"] }) {
  const { org, job } = await params;
  return <PublicJobView orgSlug={org} jobSlug={job} />;
}

export default function PublicJobPage(props: PageProps<"/careers/[org]/[job]">) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Content params={props.params} />
    </Suspense>
  );
}
