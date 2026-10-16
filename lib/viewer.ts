import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// One auth lookup per request, shared by the layout, nav and page.
export const getViewer = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
});

export const getViewerProfile = cache(async () => {
  const { supabase, user } = await getViewer();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("first_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  return data;
});
