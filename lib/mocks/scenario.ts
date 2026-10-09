export type MockScenario = "normal" | "loading" | "error" | "empty" | "rate-limited" | "expired-link";

/** Dev toggle: append ?mock=loading, error, empty or rate-limited to any URL to force that state. */
export function getMockScenario(): MockScenario {
  if (typeof window === "undefined") return "normal";
  const value = new URLSearchParams(window.location.search).get("mock");
  return value === "loading" ||
    value === "error" ||
    value === "empty" ||
    value === "rate-limited" ||
    value === "expired-link"
    ? value
    : "normal";
}
