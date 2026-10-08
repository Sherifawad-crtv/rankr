export type MockScenario = "normal" | "loading" | "error" | "empty";

/** Dev toggle: append ?mock=loading, ?mock=error or ?mock=empty to any URL to force that state. */
export function getMockScenario(): MockScenario {
  if (typeof window === "undefined") return "normal";
  const value = new URLSearchParams(window.location.search).get("mock");
  return value === "loading" || value === "error" || value === "empty" ? value : "normal";
}
