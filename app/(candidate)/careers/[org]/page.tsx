import { Suspense } from "react";
import { CareersView } from "@/components/careers/careers-view";
import { PageFallback } from "@/components/ui";

async function Content({ params }: { params: PageProps<"/careers/[org]">["params"] }) {
  const { org } = await params;
  return <CareersView orgSlug={org} />;
}

export default function CareersPage(props: PageProps<"/careers/[org]">) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Content params={props.params} />
    </Suspense>
  );
}
