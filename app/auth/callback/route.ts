import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const cookieStore = await cookies();
  const stored = cookieStore.get("auth_next")?.value;
  cookieStore.delete("auth_next");
  const next = safeNext(stored ? decodeURIComponent(stored) : undefined);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", user.id)
          .single();

        if (!profile?.first_name || !profile?.last_name) {
          const suffix = next === "/" ? "" : `?next=${encodeURIComponent(next)}`;
          return NextResponse.redirect(`${origin}/profile${suffix}`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
