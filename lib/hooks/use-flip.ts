"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

const DURATION_MS = 200;

/**
 * FLIP re-ordering: when `order` changes, rows glide from their old position to the new one.
 * Attach `rowRef(key)` to each row. Skipped with reduced motion.
 */
export function useFlip(order: string[]) {
  const elements = useRef(new Map<string, HTMLElement>());
  const previous = useRef(new Map<string, number>());
  const signature = order.join("|");

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, number>();
    elements.current.forEach((element, key) => {
      const top = element.offsetTop;
      next.set(key, top);
      const before = previous.current.get(key);
      if (!reduced && before !== undefined && before !== top) {
        element.animate(
          [{ transform: `translateY(${before - top}px)` }, { transform: "translateY(0)" }],
          { duration: DURATION_MS, easing: "cubic-bezier(0.2, 0, 0, 1)" },
        );
      }
    });
    previous.current = next;
  }, [signature]);

  return useCallback(
    (key: string) => (element: HTMLElement | null) => {
      if (element) elements.current.set(key, element);
      else elements.current.delete(key);
    },
    [],
  );
}
