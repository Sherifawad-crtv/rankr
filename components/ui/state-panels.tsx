import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { Icon, type IconName } from "./icons";
import { Skeleton } from "./skeleton";

/** Skeleton placeholder used while a screen loads. `label` is read out to screen readers. */
export function LoadingPanel({ label }: { label: string }) {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-4">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <div className="mt-2 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

function IconBubble({ name, tone }: { name: IconName; tone: "danger" | "primary" }) {
  return (
    <span
      className={`flex size-14 animate-pop items-center justify-center rounded-full ${
        tone === "danger" ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"
      }`}
    >
      <Icon name={name} variant="bold" size={28} />
    </span>
  );
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="mx-auto flex max-w-md animate-fade-up flex-col items-center gap-4 text-center">
      <IconBubble name="alert" tone="danger" />
      <p className="text-base text-text-primary">{message}</p>
      <Button onClick={onRetry}>
        <Icon name="refresh" size={18} /> Try again
      </Button>
    </Card>
  );
}

export function EmptyPanel({
  title,
  description,
  icon = "sparkles",
  action,
}: {
  title: string;
  description?: string;
  icon?: IconName;
  action?: { href: string; label: string } | ReactNode;
}) {
  return (
    <Card className="mx-auto flex max-w-md animate-fade-up flex-col items-center gap-3 text-center">
      <IconBubble name={icon} tone="primary" />
      <p className="font-display text-lg font-semibold text-text-primary">{title}</p>
      {description && <p className="text-base text-text-secondary">{description}</p>}
      {action && typeof action === "object" && "href" in action ? (
        <Link href={action.href} className="text-base font-semibold text-primary hover:underline">
          {action.label}
        </Link>
      ) : (
        action
      )}
    </Card>
  );
}
