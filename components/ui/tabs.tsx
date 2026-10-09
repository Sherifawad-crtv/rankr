"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn, focusRing } from "./cn";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ items, defaultId }: { items: TabItem[]; defaultId?: string }) {
  const base = useId();
  const [activeId, setActiveId] = useState(defaultId ?? items[0]?.id);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(event: KeyboardEvent, index: number) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = items[(index + step + items.length) % items.length];
    setActiveId(next.id);
    refs.current[next.id]?.focus();
  }

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-border-default">
        {items.map((item, index) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(node) => {
                refs.current[item.id] = node;
              }}
              role="tab"
              type="button"
              id={`${base}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "relative px-4 py-2 text-base font-semibold transition-colors duration-150 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-center after:rounded-full after:bg-primary after:transition-transform after:duration-300 after:ease-[var(--ease-soft)]",
                focusRing,
                selected
                  ? "text-primary after:scale-x-100"
                  : "text-text-secondary after:scale-x-0 hover:text-text-primary",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${base}-panel-${item.id}`}
          aria-labelledby={`${base}-tab-${item.id}`}
          hidden={item.id !== activeId}
          className="animate-fade-up pt-4"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
