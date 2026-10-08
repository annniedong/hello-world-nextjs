import type { SupabaseClient } from "@supabase/supabase-js";

export type MyVotes = Map<string, -1 | 1>;

export async function getMyVotes(
  supabase: SupabaseClient,
  userId: string | undefined,
  captionIds: string[],
): Promise<MyVotes> {
  const votes: MyVotes = new Map();
  if (!userId || captionIds.length === 0) return votes;

  const { data } = await supabase
    .from("votes")
    .select("caption_id, value")
    .eq("user_id", userId)
    .in("caption_id", captionIds);

  for (const row of data ?? []) {
    votes.set(row.caption_id, row.value === 1 ? 1 : -1);
  }
  return votes;
}
