"use client";

import { getAccountProfile } from "@/lib/api";
import { useAsync } from "./use-async";

export function useAccountProfile() {
  return useAsync(getAccountProfile);
}
