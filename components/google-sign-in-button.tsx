"use client";

import { useState } from "react";
import { GoogleIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton({ next }: { next?: string }) {
  const [pending, setPending] = useState(false);

  async function handleSignIn() {
    setPending(true);

    // The redirect URI stays the bare /auth/callback, so the destination
    // travels in a short-lived cookie that the callback route reads.
    if (next) {
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `auth_next=${encodeURIComponent(next)}; path=/; max-age=600; SameSite=Lax${secure}`;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-6 text-base font-semibold text-[#1f1f1f] shadow-sm transition-colors hover:bg-[#f7f7f7] disabled:opacity-60"
    >
      <GoogleIcon />
      {pending ? "Opening Google…" : "Continue with Google"}
    </button>
  );
}
