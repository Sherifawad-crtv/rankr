/**
 * Feature flags. Public flags use NEXT_PUBLIC_ so they work in client components;
 * the entry flow is checked on the server only.
 */
export const flags = {
  /** The sign-up funnel (plans, checkout, workspace setup). Hidden until it is ready. */
  entryFlow: () => process.env.SHOW_ENTRY_FLOW === "true",
  /** The Arabic language option. English ships first. */
  arabicUi: () => process.env.NEXT_PUBLIC_ENABLE_ARABIC === "true",
};
