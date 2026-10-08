import { getMockScenario } from "./scenario";

const DEFAULT_LATENCY_MS = 300;

export function simulateLatency<T>(value: T, ms = DEFAULT_LATENCY_MS): Promise<T> {
  const scenario = getMockScenario();
  if (scenario === "loading") return new Promise<T>(() => {});
  if (scenario === "error") {
    return new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Mock error scenario")), ms),
    );
  }
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** Like simulateLatency, but returns an empty list under the `empty` scenario. */
export function simulateList<T>(items: T[], ms = DEFAULT_LATENCY_MS): Promise<T[]> {
  return simulateLatency(getMockScenario() === "empty" ? [] : items, ms);
}
