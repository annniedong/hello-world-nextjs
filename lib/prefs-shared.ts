// Safe to import from client components (no server-only imports).
export const GOALS = [
  { votes: 3, name: "Casual", blurb: "3 votes a day" },
  { votes: 5, name: "Regular", blurb: "5 votes a day" },
  { votes: 10, name: "Local", blurb: "10 votes a day" },
] as const;

export const DEFAULT_GOAL = 5;

export const PREF_COOKIES = {
  onboarded: "nyc_onboarded",
  goal: "nyc_goal",
  voice: "nyc_voice",
} as const;
