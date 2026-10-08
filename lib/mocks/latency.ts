const DEFAULT_LATENCY_MS = 300;

export function simulateLatency<T>(value: T, ms = DEFAULT_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
