/**
 * English messages. Keys are the contract: every user-facing string goes here as a key,
 * and the Arabic file mirrors it. Use {name} placeholders for values.
 */
export const en = {
  "nav.dashboard": "Dashboard",
  "nav.jobs": "Jobs",
  "nav.messages": "Messages",
  "nav.analytics": "Analytics",
  "nav.billing": "Billing",
  "nav.settings": "Settings",
  "nav.main": "Main",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",

  "common.tryAgain": "Try again",
  "common.close": "Close",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.loading": "Loading…",

  "disclaimer.scores":
    "Scores are a decision aid, not a decision. A person must review every candidate. Rankr never rejects anyone automatically.",

  "confidence.high": "High confidence",
  "confidence.medium": "Medium confidence",
  "confidence.low": "Low confidence",
  "confidence.lowHint": "We weren't confident reading this CV. Please review it by hand.",

  "skill.required": "Required",
  "skill.preferred": "Preferred",
  "skill.niceToHave": "Nice to have",
  "skill.matched": "Matched",
  "skill.missing": "Missing",
  "skill.extra": "Extra",

  "status.pending": "Waiting",
  "status.processing": "Working",
  "status.done": "Scored",
  "status.failed": "Couldn't read",
  "status.duplicate": "Duplicate",
  "step.detecting": "Checking",
  "step.reading": "Reading",
  "step.parsing": "Understanding",
  "step.scoring": "Scoring",

  "table.selectRow": "Select {name}",
  "table.selectAll": "Select all rows",
} as const;

export type MessageKey = keyof typeof en;
