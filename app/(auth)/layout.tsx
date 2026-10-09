import type { ReactNode } from "react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 sm:px-8 lg:px-16">
        <Logo height={28} />
        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</main>
      </div>
      <AuthPanel />
    </div>
  );
}
