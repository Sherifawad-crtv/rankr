"use client";

import { useRef, useState, type DragEvent } from "react";
import { Button, Icon } from "@/components/ui";
import { cn } from "@/components/ui/cn";
import { MAX_CVS_PER_RUN } from "@/lib/limits";
import { useLocale } from "@/lib/i18n/locale-context";

interface DropzoneProps {
  accept: string;
  onFiles: (files: File[]) => void;
}

export function Dropzone({ accept, onFiles }: DropzoneProps) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    onFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-all duration-300 ease-[var(--ease-soft)]",
        dragging
          ? "scale-[1.015] border-primary bg-primary/5 shadow-md"
          : "border-border-default bg-surface hover:border-primary/60",
      )}
    >
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 ease-[var(--ease-spring)]",
          dragging && "scale-110 animate-bounce-soft",
        )}
      >
        <Icon name="upload" variant="bold" size={28} />
      </span>
      <p className="font-display text-lg font-semibold text-text-primary">
        {dragging ? t("upload.drop.titleActive") : t("upload.drop.title")}
      </p>
      <p className="text-sm text-text-secondary">{t("upload.drop.hint", { max: MAX_CVS_PER_RUN })}</p>
      <Button variant="secondary" onClick={() => inputRef.current?.click()}>
        {t("upload.drop.choose")}
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="sr-only"
        aria-label={t("upload.drop.aria")}
        tabIndex={-1}
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
    </div>
  );
}
