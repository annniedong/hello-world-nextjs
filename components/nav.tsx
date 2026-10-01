import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 text-sm dark:border-zinc-800">
      <Link href="/" className="font-semibold">
        Jokes
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        {user ? (
          <>
            <Link href="/profile" className="hover:underline">
              Profile
            </Link>
            <SignOutButton />
          </>
        ) : (
          <Link href="/login" className="hover:underline">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
