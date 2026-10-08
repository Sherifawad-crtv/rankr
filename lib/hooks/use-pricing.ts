"use client";

import { getPricing } from "@/lib/api";
import { useAsync } from "./use-async";

export function usePricing() {
  return useAsync(getPricing);
}
