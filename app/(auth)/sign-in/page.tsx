import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { safeNext } from "@/lib/auth";
import { flags } from "@/lib/flags";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function SignInContent({ searchParams }: { searchParams: SearchParams }) {
  const { next } = await searchParams;
  return (
    <SignInForm
      next={safeNext(Array.isArray(next) ? next[0] : next)}
      signUpHref={flags.entryFlow() ? "/plans" : null}
    />
  );
}

export default function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={null}>
      <SignInContent searchParams={searchParams} />
    </Suspense>
  );
}
