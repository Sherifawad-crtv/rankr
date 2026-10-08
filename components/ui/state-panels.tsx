import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { Icon } from "./icons";

export function LoadingPanel({ label }: { label: string }) {
  return (
    <p role="status" className="py-12 text-center text-text-secondary">
      {label}
    </p>
  );
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
      <Icon name="alert" size={28} className="text-danger" />
      <p className="text-base text-text-primary">{message}</p>
      <Button onClick={onRetry}>Try again</Button>
    </Card>
  );
}

export function EmptyPanel({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string } | ReactNode;
}) {
  return (
    <Card className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
      <p className="text-lg font-medium text-text-primary">{title}</p>
      {description && <p className="text-base text-text-secondary">{description}</p>}
      {action && typeof action === "object" && "href" in action ? (
        <Link href={action.href} className="text-base font-medium text-primary hover:underline">
          {action.label}
        </Link>
      ) : (
        action
      )}
    </Card>
  );
}
