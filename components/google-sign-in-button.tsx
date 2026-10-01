"use client";

import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  async function handleSignIn() {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      onClick={handleSignIn}
      className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
    >
      Sign in with Google
    </button>
  );
}
