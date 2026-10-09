"use client";

import { useEffect, useState } from "react";

const INTERVAL_MS = 2600;

/** Cycles through short lines of copy. Remount (change `key`) to restart. */
export function RotatingTip({ tips }: { tips: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (tips.length < 2) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % tips.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [tips.length]);

  return (
    <p key={index} className="animate-fade-up text-base text-text-secondary">
      {tips[index]}
    </p>
  );
}
