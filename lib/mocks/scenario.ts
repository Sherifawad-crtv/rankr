export type MockScenario = "normal" | "loading" | "error";

/** Dev toggle: append ?mock=loading or ?mock=error to any URL to force that state. */
export function getMockScenario(): MockScenario {
  if (typeof window === "undefined") return "normal";
  const value = new URLSearchParams(window.location.search).get("mock");
  return value === "loading" || value === "error" ? value : "normal";
}
