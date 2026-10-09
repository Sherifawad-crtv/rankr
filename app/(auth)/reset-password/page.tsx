import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function ResetContent({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={(Array.isArray(token) ? token[0] : token) ?? null} />;
}

export default function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={null}>
      <ResetContent searchParams={searchParams} />
    </Suspense>
  );
}
