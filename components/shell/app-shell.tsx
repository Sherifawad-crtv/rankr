"use client";

import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Badge, Button, Icon } from "@/components/ui";
import { signOut as signOutRequest } from "@/lib/api";
import { useLocale } from "@/lib/i18n/locale-context";
import { LanguageToggle } from "./language-toggle";
import { useSession } from "@/lib/session";
import { Logo } from "@/components/brand/logo";
import { DevSwitcher } from "./dev-switcher";
import { NavLinks } from "./nav-links";

function Brand() {
  return <Logo height={26} />;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useSession();
  const { t } = useLocale();
  const router = useRouter();
  const drawerRef = useRef<HTMLDialogElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const node = drawerRef.current;
    if (!node) return;
    if (drawerOpen && !node.open) node.showModal();
    if (!drawerOpen && node.open) node.close();
  }, [drawerOpen]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-e border-border-default bg-surface p-4 lg:flex lg:flex-col lg:gap-6">
        <div className="px-3 pt-2">
          <Brand />
        </div>
        <Suspense fallback={null}>
          <NavLinks />
        </Suspense>
      </aside>

      <dialog
        ref={drawerRef}
        onClose={() => setDrawerOpen(false)}
        onClick={(event) => {
          if (event.target === drawerRef.current) setDrawerOpen(false);
        }}
        aria-label="Navigation"
        data-drawer
        className="m-0 h-full max-h-none w-64 max-w-[80vw] bg-surface p-4 backdrop:bg-inverse/50"
      >
        <div className="mb-6 flex items-center justify-between px-3 pt-2">
          <Brand />
          <Button variant="ghost" size="sm" aria-label={t("nav.closeMenu")} onClick={() => setDrawerOpen(false)}>
            <Icon name="close" />
          </Button>
        </div>
        <Suspense fallback={null}>
          <NavLinks onNavigate={() => setDrawerOpen(false)} />
        </Suspense>
      </dialog>

      <div className="flex min-w-0 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-border-default bg-surface px-4 py-3 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            aria-label={t("nav.openMenu")}
            onClick={() => setDrawerOpen(true)}
          >
            <Icon name="menu" />
          </Button>
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="ms-auto flex flex-wrap items-center gap-3">
            <LanguageToggle />
            <DevSwitcher />
            <Badge tone="primary">{user.planMode === "solo" ? "Solo" : "Enterprise"}</Badge>
            <Avatar name={user.name} />
            <span className="sr-only">{user.name}</span>
            <Button
              variant="ghost"
              size="sm"
              aria-label={t("auth.signOut")}
              title={t("auth.signOut")}
              onClick={async () => {
                await signOutRequest();
                signOut();
                router.push("/sign-in");
              }}
            >
              <Icon name="logout" size={18} className="rtl:-scale-x-100" />
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
