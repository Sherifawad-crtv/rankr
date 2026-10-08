"use client";

import { useCallback, useEffect, useState } from "react";

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: T };

/** Runs a mock/API loader once on mount; `retry` re-runs it after an error. */
export function useAsync<T>(load: () => Promise<T>): { state: AsyncState<T>; retry: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });

  const run = useCallback(() => {
    load().then(
      (data) => setState({ status: "ready", data }),
      () => setState({ status: "error" }),
    );
  }, [load]);

  useEffect(run, [run]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    run();
  }, [run]);

  return { state, retry };
}
