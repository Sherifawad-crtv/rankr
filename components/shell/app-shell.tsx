"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Badge, Button, Icon } from "@/components/ui";
import { useSession } from "@/lib/session";
import { DevSwitcher } from "./dev-switcher";
import { NavLinks } from "./nav-links";

function Brand() {
  return <span className="text-lg font-semibold text-text-primary">Rankr</span>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useSession();
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
        <NavLinks />
      </aside>

      <dialog
        ref={drawerRef}
        onClose={() => setDrawerOpen(false)}
        onClick={(event) => {
          if (event.target === drawerRef.current) setDrawerOpen(false);
        }}
        aria-label="Navigation"
        className="m-0 h-full max-h-none w-64 max-w-[80vw] bg-surface p-4 backdrop:bg-inverse/50"
      >
        <div className="mb-6 flex items-center justify-between px-3 pt-2">
          <Brand />
          <Button variant="ghost" size="sm" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
            <Icon name="close" />
          </Button>
        </div>
        <NavLinks onNavigate={() => setDrawerOpen(false)} />
      </dialog>

      <div className="flex min-w-0 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-border-default bg-surface px-4 py-3 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Icon name="list" />
          </Button>
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="ms-auto flex flex-wrap items-center gap-3">
            <DevSwitcher />
            <Badge tone="primary">{user.planMode === "solo" ? "Solo" : "Enterprise"}</Badge>
            <span className="text-sm text-text-secondary">{user.name}</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
