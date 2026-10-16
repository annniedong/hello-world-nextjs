import { cache } from "react";
import { getPrefs } from "@/lib/prefs";
import { computeProgress, type Progress } from "@/lib/progress-calc";
import { getViewer } from "@/lib/viewer";

export { LEVELS, XP, type Progress } from "@/lib/progress-calc";

export const getViewerProgress = cache(async (): Promise<Progress | null> => {
  const { supabase, user } = await getViewer();
  if (!user) return null;
  const { goal } = await getPrefs();

  const [votes, images] = await Promise.all([
    supabase
      .from("votes")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("images")
      .select("created_at, captions(vote_count)")
      .eq("user_id", user.id),
  ]);

  const photoRows = (images.data ?? []) as {
    created_at: string;
    captions: { vote_count: number }[];
  }[];

  return computeProgress({
    voteDates: (votes.data ?? []).map((v) => v.created_at),
    photoDates: photoRows.map((p) => p.created_at),
    votesReceived: photoRows.reduce(
      (total, p) => total + p.captions.reduce((sum, c) => sum + c.vote_count, 0),
      0,
    ),
    goal,
  });
});
