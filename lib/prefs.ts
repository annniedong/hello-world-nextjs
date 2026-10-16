import { cache } from "react";
import { cookies } from "next/headers";
import { DEFAULT_GOAL, GOALS, PREF_COOKIES } from "@/lib/prefs-shared";
import { getVoice } from "@/lib/voices";

// Preferences live in plain cookies so the server can personalize the page.
export const getPrefs = cache(async () => {
  const store = await cookies();

  const goal = Number(store.get(PREF_COOKIES.goal)?.value);
  const voiceId = store.get(PREF_COOKIES.voice)?.value;

  return {
    onboarded: store.get(PREF_COOKIES.onboarded)?.value === "1",
    goal: GOALS.some((g) => g.votes === goal) ? goal : DEFAULT_GOAL,
    voiceId: voiceId && getVoice(voiceId) ? voiceId : undefined,
  };
});
