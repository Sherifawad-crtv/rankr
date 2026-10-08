"use client";

import { useRef, useState, type DragEvent } from "react";
import { Button, Icon } from "@/components/ui";
import { cn } from "@/components/ui/cn";

interface DropzoneProps {
  accept: string;
  hint: string;
  onFiles: (files: File[]) => void;
}

export function Dropzone({ accept, hint, onFiles }: DropzoneProps) {
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
        "flex flex-col items-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
        dragging ? "border-primary bg-primary/5" : "border-border-default bg-surface",
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon name="upload" size={24} />
      </span>
      <p className="text-lg font-medium text-text-primary">Drag and drop CVs here</p>
      <p className="text-sm text-text-secondary">{hint}</p>
      <Button variant="secondary" onClick={() => inputRef.current?.click()}>
        Choose files
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="sr-only"
        aria-label="Choose CV files"
        tabIndex={-1}
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
    </div>
  );
}
