"use client";

import { useCallback, useEffect, useState } from "react";
import { getPricing } from "@/lib/api";
import type { PricingCatalog } from "@/types";

export type PricingState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; pricing: PricingCatalog };

export function usePricing(): { state: PricingState; retry: () => void } {
  const [state, setState] = useState<PricingState>({ status: "loading" });

  const fetchPricing = useCallback(() => {
    getPricing().then(
      (pricing) => setState({ status: "ready", pricing }),
      () => setState({ status: "error" }),
    );
  }, []);

  useEffect(fetchPricing, [fetchPricing]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    fetchPricing();
  }, [fetchPricing]);

  return { state, retry };
}
