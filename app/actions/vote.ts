"use server";

import { refresh } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function castVote(
  captionId: string,
  value: -1 | 0 | 1,
): Promise<{ error?: string }> {
  if (!UUID.test(captionId) || ![-1, 0, 1].includes(value)) {
    return { error: "Invalid vote." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sign in to vote." };
  }

  const { error } =
    value === 0
      ? await supabase
          .from("votes")
          .delete()
          .eq("caption_id", captionId)
          .eq("user_id", user.id)
      : await supabase
          .from("votes")
          .upsert(
            { caption_id: captionId, user_id: user.id, value },
            { onConflict: "caption_id,user_id" },
          );

  if (error) {
    console.error("Vote failed", error);
    return { error: "Couldn't save your vote." };
  }

  refresh();
  return {};
}
