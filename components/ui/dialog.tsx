"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./button";
import { Icon } from "./icons";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** Modal built on the native <dialog>: focus trapping, Esc and backdrop come from the browser. */
export function Dialog({ open, onClose, title, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-label={title}
      className="m-auto w-full max-w-lg rounded-lg bg-surface p-0 text-text-primary shadow-lg backdrop:bg-inverse/50"
    >
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <h2 className="text-lg font-medium">{title}</h2>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </Button>
      </div>
      <div className="p-6">{children}</div>
    </dialog>
  );
}
