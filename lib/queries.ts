import type { SupabaseClient } from "@supabase/supabase-js";
import { hoursAgo } from "@/lib/time";

export type TopCaption = {
  id: string;
  content: string;
  score: number;
  images: { id: string; storage_path: string };
};

export async function getTopCaptions(
  supabase: SupabaseClient,
  { hours, limit }: { hours: number | null; limit: number },
) {
  let query = supabase
    .from("captions")
    .select("id, content, score, images(id, storage_path)")
    .gt("vote_count", 0)
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (hours) {
    query = query.gte("created_at", hoursAgo(hours));
  }

  const { data, error } = await query;
  return { captions: (data ?? []) as unknown as TopCaption[], error };
}
