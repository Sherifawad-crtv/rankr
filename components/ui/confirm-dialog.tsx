"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/locale-context";
import { Button } from "./button";
import { Dialog } from "./dialog";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  /** `danger` for destructive actions such as deleting data. */
  tone?: "primary" | "danger";
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

/** Asks before an action that is hard to undo. The confirm button shows a spinner while it runs. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = "primary",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const { t } = useLocale();
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className="text-base text-text-secondary">{description}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={busy}>
          {t("common.cancel")}
        </Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} loading={busy} onClick={confirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
