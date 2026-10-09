"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "./cn";
import { Icon } from "./icons";

type ToastTone = "neutral" | "match" | "danger";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastApi {
  show: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
const DISMISS_MS = 4000;

const tones: Record<ToastTone, string> = {
  neutral: "bg-inverse text-text-inverse",
  match: "bg-inverse text-text-inverse",
  danger: "bg-inverse text-text-inverse",
};

const toneIcon: Record<ToastTone, { name: "info" | "check" | "alert"; className: string }> = {
  neutral: { name: "info", className: "text-text-inverse" },
  match: { name: "check", className: "text-match" },
  danger: { name: "alert", className: "text-danger" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, tone: ToastTone = "neutral") => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current, { id, message, tone }]);
    setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), DISMISS_MS);
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex animate-toast-in items-center gap-2 rounded-xl px-4 py-3 text-base font-medium shadow-lg",
              tones[item.tone],
            )}
          >
            <Icon name={toneIcon[item.tone].name} variant="bold" className={toneIcon[item.tone].className} />
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used within ToastProvider");
  return value;
}
